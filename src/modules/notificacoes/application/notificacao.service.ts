import { PermissaoService } from "@modules/permissoes/application/services/permissao.service";
import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { EmailService } from "@shared/infra/email/email.service";
import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { ConfigNotificacaoService } from "./config-notificacao.service";
import { notificacaoSchema } from "../infra/schemas/notificacao.schema";

export interface Evento {
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string | null;
  chave: string;
}

export interface Destino {
  /** Todos os usuários ativos com esta permissão (ADMINISTRADOR sempre recebe). */
  permissao?: string;
  usuarios?: (bigint | string | number)[];
  /** Quem causou o evento não é avisado do próprio ato. */
  exceto?: bigint | string | number | null;
}

export interface NotificacaoResponse {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  criadaEm: string;
}

interface UsuarioAtivo {
  id: bigint;
  perfil: string;
  permissions: string[];
}

export function quemTemPermissao(usuarios: UsuarioAtivo[], perfisComPermissao: string[], permissao: string) {
  return usuarios
    .filter(
      (u) =>
        u.perfil === "ADMINISTRADOR" ||
        perfisComPermissao.includes(u.perfil) ||
        u.permissions.some((p) => ["ADMIN", permissao].includes(p.toUpperCase())),
    )
    .map((u) => u.id);
}

export interface EnvioResponse {
  id: string;
  tipo: string;
  titulo: string;
  destinatario: string;
  lida: boolean;
  criadaEm: string;
}

@Injectable()
export class NotificacaoService {
  private readonly logger = new Logger(NotificacaoService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly permissoes: PermissaoService,
    private readonly config: ConfigNotificacaoService,
    private readonly email: EmailService,
  ) {}

  /** Nunca lança: falha ao avisar não pode desfazer a operação principal. */
  async notificar(evento: Evento, destino: Destino): Promise<void> {
    try {
      const config = await this.config.doTipo(evento.tipo);
      if (config && !config.ativo) return;

      const ids = new Set((destino.usuarios ?? []).map((id) => BigInt(id)));
      if (destino.permissao) for (const id of await this.comPermissao(destino.permissao)) ids.add(id);
      if (destino.exceto != null) ids.delete(BigInt(destino.exceto));
      if (ids.size === 0) return;

      const novas = await this.drizzle.db
        .insert(notificacaoSchema)
        .values([...ids].map((idUsuario) => ({ ...evento, link: evento.link ?? null, idUsuario })))
        .onConflictDoNothing()
        .returning({ idUsuario: notificacaoSchema.idUsuario });
      if (config?.email && novas.length) await this.enviarEmails(evento, novas.map((n) => n.idUsuario));
    } catch (error) {
      this.logger.error(`Falha ao gerar notificação ${evento.chave}.`, error);
    }
  }

  async listar(usuarioId: string): Promise<{ naoLidas: number; itens: NotificacaoResponse[] }> {
    const idUsuario = BigInt(usuarioId);
    const itens = await this.drizzle.db
      .select()
      .from(notificacaoSchema)
      .where(eq(notificacaoSchema.idUsuario, idUsuario))
      .orderBy(desc(notificacaoSchema.createdAt), desc(notificacaoSchema.id))
      .limit(50);
    const [{ total }] = await this.drizzle.db
      .select({ total: count() })
      .from(notificacaoSchema)
      .where(and(eq(notificacaoSchema.idUsuario, idUsuario), isNull(notificacaoSchema.lidaEm)));

    return {
      naoLidas: Number(total),
      itens: itens.map((n) => ({
        id: n.id.toString(),
        tipo: n.tipo,
        titulo: n.titulo,
        mensagem: n.mensagem,
        link: n.link,
        lida: n.lidaEm !== null,
        criadaEm: n.createdAt.toISOString(),
      })),
    };
  }

  async marcarLida(usuarioId: string, id: string): Promise<void> {
    if (!/^\d+$/.test(id)) throw new NotFoundException("Notificação não encontrada.");
    const alteradas = await this.drizzle.db
      .update(notificacaoSchema)
      .set({ lidaEm: new Date() })
      .where(and(eq(notificacaoSchema.id, BigInt(id)), eq(notificacaoSchema.idUsuario, BigInt(usuarioId))))
      .returning({ id: notificacaoSchema.id });
    if (alteradas.length === 0) throw new NotFoundException("Notificação não encontrada.");
  }

  async marcarTodas(usuarioId: string): Promise<void> {
    await this.drizzle.db
      .update(notificacaoSchema)
      .set({ lidaEm: new Date() })
      .where(and(eq(notificacaoSchema.idUsuario, BigInt(usuarioId)), isNull(notificacaoSchema.lidaEm)));
  }

  /** Últimos avisos gerados para toda a equipe (histórico de envios). */
  async envios(): Promise<EnvioResponse[]> {
    const linhas = await this.drizzle.db
      .select({
        id: notificacaoSchema.id,
        tipo: notificacaoSchema.tipo,
        titulo: notificacaoSchema.titulo,
        destinatario: usuariosSchema.name,
        lidaEm: notificacaoSchema.lidaEm,
        criadaEm: notificacaoSchema.createdAt,
      })
      .from(notificacaoSchema)
      .innerJoin(usuariosSchema, eq(usuariosSchema.id, notificacaoSchema.idUsuario))
      .orderBy(desc(notificacaoSchema.createdAt), desc(notificacaoSchema.id))
      .limit(100);
    return linhas.map((l) => ({
      id: l.id.toString(),
      tipo: l.tipo,
      titulo: l.titulo,
      destinatario: l.destinatario,
      lida: l.lidaEm !== null,
      criadaEm: l.criadaEm.toISOString(),
    }));
  }

  private async enviarEmails(evento: Evento, ids: bigint[]) {
    const destinatarios = await this.drizzle.db
      .select({ email: usuariosSchema.email, nome: usuariosSchema.name })
      .from(usuariosSchema)
      .where(inArray(usuariosSchema.id, ids));
    const base = process.env.APP_URL ?? "http://localhost:8080";
    for (const d of destinatarios) {
      try {
        await this.email.enviar({
          para: d.email,
          assunto: `${evento.titulo} — Urbizzi`,
          texto: `Olá, ${d.nome}.\n\n${evento.mensagem}${evento.link ? `\n\nAbrir: ${base.replace(/\/$/, "")}${evento.link}` : ""}`,
        });
      } catch (error) {
        this.logger.error(`Falha ao enviar e-mail de ${evento.chave} para ${d.email}.`, error);
      }
    }
  }

  private async comPermissao(permissao: string): Promise<bigint[]> {
    const { matriz } = await this.permissoes.obterMatriz();
    const perfis = (matriz as Record<string, string[]>)[permissao] ?? [];
    const usuarios = await this.drizzle.db
      .select({ id: usuariosSchema.id, perfil: usuariosSchema.perfil, permissions: usuariosSchema.permissions })
      .from(usuariosSchema)
      .where(eq(usuariosSchema.status, "ATIVO"));
    return quemTemPermissao(usuarios, perfis, permissao);
  }
}
