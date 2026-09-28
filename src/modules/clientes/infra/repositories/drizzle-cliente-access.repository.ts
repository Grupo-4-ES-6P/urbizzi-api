import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import {
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, eq } from "drizzle-orm";
import type {
  ClienteAccessRepository,
  StatusAcessoCliente,
} from "../../domain/repositories/cliente-access.repository";
import { clienteSchema } from "../schemas/cliente.schema";
import { clienteAccessTokenSchema } from "../schemas/cliente-access-token.schema";

@Injectable()
export class DrizzleClienteAccessRepository implements ClienteAccessRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async emailExists(email: string): Promise<boolean> {
    const [row] = await this.drizzleService.db
      .select({ id: usuariosSchema.id })
      .from(usuariosSchema)
      .where(eq(usuariosSchema.email, email))
      .limit(1);
    return Boolean(row);
  }

  async createForClient(input: {
    clienteId: bigint;
    email: string;
    passwordHash: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.drizzleService.db.transaction(async (tx) => {
      const [cliente] = await tx
        .select()
        .from(clienteSchema)
        .where(eq(clienteSchema.id, input.clienteId))
        .limit(1);
      if (!cliente) throw new NotFoundException("Cliente não encontrado.");
      if (cliente.usuarioId) {
        throw new ConflictException("Cliente já possui acesso associado.");
      }

      const [usuario] = await tx
        .insert(usuariosSchema)
        .values({
          email: input.email,
          password: input.passwordHash,
          permissions: ["CLIENTE_ACESSAR"],
          status: "PENDENTE_ATIVACAO",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      await tx
        .update(clienteSchema)
        .set({ usuarioId: usuario.id, dataAtualizacao: new Date() })
        .where(eq(clienteSchema.id, input.clienteId));
      await tx.insert(clienteAccessTokenSchema).values({
        usuarioId: usuario.id,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      });
    });
  }

  async renewInvitation(input: {
    clienteId: bigint;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<string> {
    return this.drizzleService.db.transaction(async (tx) => {
      const [result] = await tx
        .select({ usuario: usuariosSchema })
        .from(clienteSchema)
        .innerJoin(
          usuariosSchema,
          eq(clienteSchema.usuarioId, usuariosSchema.id),
        )
        .where(eq(clienteSchema.id, input.clienteId))
        .limit(1);
      if (!result)
        throw new NotFoundException("Acesso do cliente não encontrado.");
      if (result.usuario.status !== "PENDENTE_ATIVACAO") {
        throw new ConflictException("Acesso já foi ativado ou está bloqueado.");
      }
      await tx
        .delete(clienteAccessTokenSchema)
        .where(eq(clienteAccessTokenSchema.usuarioId, result.usuario.id));
      await tx.insert(clienteAccessTokenSchema).values({
        usuarioId: result.usuario.id,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      });
      return result.usuario.email;
    });
  }

  async activate(input: {
    tokenHash: string;
    passwordHash: string;
  }): Promise<void> {
    await this.drizzleService.db.transaction(async (tx) => {
      const [token] = await tx
        .select()
        .from(clienteAccessTokenSchema)
        .where(eq(clienteAccessTokenSchema.tokenHash, input.tokenHash))
        .limit(1);
      if (!token) throw new NotFoundException("Token de ativação inválido.");
      if (token.expiresAt.getTime() <= Date.now()) {
        await tx
          .delete(clienteAccessTokenSchema)
          .where(eq(clienteAccessTokenSchema.id, token.id));
        throw new GoneException("Token de ativação expirado.");
      }
      await tx
        .update(usuariosSchema)
        .set({
          password: input.passwordHash,
          status: "ATIVO",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(usuariosSchema.id, token.usuarioId),
            eq(usuariosSchema.status, "PENDENTE_ATIVACAO"),
          ),
        );
      await tx
        .delete(clienteAccessTokenSchema)
        .where(eq(clienteAccessTokenSchema.usuarioId, token.usuarioId));
    });
  }

  async changeStatus(
    clienteId: bigint,
    status: StatusAcessoCliente,
  ): Promise<void> {
    const [cliente] = await this.drizzleService.db
      .select({ usuarioId: clienteSchema.usuarioId })
      .from(clienteSchema)
      .where(eq(clienteSchema.id, clienteId))
      .limit(1);
    if (!cliente) throw new NotFoundException("Cliente não encontrado.");
    if (!cliente.usuarioId) {
      throw new NotFoundException("Cliente não possui acesso associado.");
    }
    await this.drizzleService.db
      .update(usuariosSchema)
      .set({ status, updatedAt: new Date() })
      .where(eq(usuariosSchema.id, cliente.usuarioId));
  }

  async deactivateClient(clienteId: bigint): Promise<void> {
    await this.drizzleService.db.transaction(async (tx) => {
      const [cliente] = await tx
        .select({ usuarioId: clienteSchema.usuarioId })
        .from(clienteSchema)
        .where(eq(clienteSchema.id, clienteId))
        .limit(1);
      if (!cliente) throw new NotFoundException("Cliente não encontrado.");

      await tx
        .update(clienteSchema)
        .set({ status: "INATIVO", dataAtualizacao: new Date() })
        .where(eq(clienteSchema.id, clienteId));
      if (cliente.usuarioId) {
        await tx
          .update(usuariosSchema)
          .set({ status: "INATIVO", updatedAt: new Date() })
          .where(eq(usuariosSchema.id, cliente.usuarioId));
      }
    });
  }
}
