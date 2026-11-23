import { PermissaoService } from "@modules/permissoes/application/services/permissao.service";
import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, count, desc, eq, isNull } from "drizzle-orm";
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


@Injectable()
export class NotificacaoService {
  private readonly logger = new Logger(NotificacaoService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly permissoes: PermissaoService,
  ) {}

  /** Nunca lança: falha ao avisar não pode desfazer a operação principal. */
  async notificar(evento: Evento, destino: Destino): Promise<void> {
    try {
      const ids = new Set((destino.usuarios ?? []).map((id) => BigInt(id)));
      if (destino.permissao) for (const id of await this.comPermissao(destino.permissao)) ids.add(id);
      if (destino.exceto != null) ids.delete(BigInt(destino.exceto));
      if (ids.size === 0) return;

      await this.drizzle.db
        .insert(notificacaoSchema)
        .values([...ids].map((idUsuario) => ({ ...evento, link: evento.link ?? null, idUsuario })))
        .onConflictDoNothing();
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
