import { loteSchema } from "@modules/lote/infra/schemas/lote.schema";
import { ConfigNotificacaoService } from "@modules/notificacoes/application/config-notificacao.service";
import { NotificacaoService } from "@modules/notificacoes/application/notificacao.service";
import { Injectable, Logger, type OnApplicationBootstrap, type OnModuleDestroy } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, eq, gte, inArray, lt, lte, sql } from "drizzle-orm";
import { propostaSchema } from "../../infra/schemas/proposta.schema";

const HORA = 60 * 60 * 1000;
const dataCurta = (d: Date) =>
  d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Reserva = lote com proposta pendente; o prazo da proposta é o prazo da reserva. */
@Injectable()
export class PropostaPrazoService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PropostaPrazoService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly notificacoes: NotificacaoService,
    private readonly config: ConfigNotificacaoService,
  ) {}

  onApplicationBootstrap() {
    void this.verificar();
    this.timer = setInterval(() => void this.verificar(), 60_000);
    this.timer.unref();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }

  async verificar(agora = new Date()): Promise<void> {
    try {
      await this.expirarVencidas(agora);
      await this.avisarVencendo(agora);
    } catch (error) {
      this.logger.error("Falha ao verificar prazos de proposta.", error);
    }
  }

  async expirarVencidas(agora: Date): Promise<number> {
    const vencidas = await this.drizzle.db
      .update(propostaSchema)
      .set({
        status: "recusada",
        justificativa: "Prazo de resposta expirado",
        detalhes: sql`${propostaSchema.detalhes} || ${JSON.stringify({ motivoRecusa: "Prazo de resposta expirado", decididaEm: agora.toISOString() })}::jsonb`,
      })
      .where(and(eq(propostaSchema.status, "pendente"), lt(propostaSchema.prazoResposta, agora)))
      .returning({
        id: propostaSchema.idProposta,
        codigo: propostaSchema.codigo,
        idLote: propostaSchema.idLote,
        idUsuario: propostaSchema.idUsuario,
      });
    if (vencidas.length === 0) return 0;

    await this.drizzle.db
      .update(loteSchema)
      .set({ estado: "disponivel", updatedAt: agora })
      .where(
        and(
          inArray(loteSchema.id, vencidas.map((v) => BigInt(v.idLote))),
          eq(loteSchema.estado, "reservado"),
        ),
      );
    for (const p of vencidas) {
      await this.notificacoes.notificar(
        {
          tipo: "reserva_expirada",
          titulo: "Reserva expirada",
          mensagem: `A proposta ${p.codigo ?? `#${p.id}`} passou do prazo sem resposta; o lote voltou a ficar disponível.`,
          link: `/propostas/${p.id}`,
          chave: `reserva-expirada:${p.id}`,
        },
        { usuarios: [p.idUsuario] },
      );
    }
    this.logger.log(`${vencidas.length} proposta(s) expirada(s); lote(s) liberado(s).`);
    return vencidas.length;
  }

  private async avisarVencendo(agora: Date): Promise<void> {
    const horas = (await this.config.doTipo("reserva_vencendo"))?.antecedenciaHoras ?? 48;
    const vencendo = await this.drizzle.db
      .select({
        id: propostaSchema.idProposta,
        codigo: propostaSchema.codigo,
        idLote: propostaSchema.idLote,
        idUsuario: propostaSchema.idUsuario,
        prazo: propostaSchema.prazoResposta,
      })
      .from(propostaSchema)
      .where(
        and(
          eq(propostaSchema.status, "pendente"),
          gte(propostaSchema.prazoResposta, agora),
          lte(propostaSchema.prazoResposta, new Date(agora.getTime() + horas * HORA)),
        ),
      );
    for (const p of vencendo) {
      await this.notificacoes.notificar(
        {
          tipo: "reserva_vencendo",
          titulo: "Reserva perto de vencer",
          mensagem: `A proposta ${p.codigo ?? `#${p.id}`} vence em ${dataCurta(p.prazo!)}; sem resposta, o lote volta a ficar disponível.`,
          link: `/propostas/${p.id}`,
          chave: `reserva-vencendo:${p.id}`,
        },
        { permissao: "APROVAR_PROPOSTA", usuarios: [p.idUsuario] },
      );
    }
  }
}
