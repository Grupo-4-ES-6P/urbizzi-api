import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, count, eq, ilike, or, type SQL } from "drizzle-orm";
import {
  ClienteEntity,
  type ClienteEntityProps,
} from "../../domain/models/cliente.entity";
import type {
  AtualizarClienteInput,
  BuscarClientesPaginadoInput,
  BuscarClientesPaginadoResultado,
  ClienteRepository,
  NovoAcessoPendenteInput,
  NovoClienteInput,
} from "../../domain/repositories/cliente.repository";
import { clienteSchema } from "../schemas/cliente.schema";
import { clienteAccessTokenSchema } from "../schemas/cliente-access-token.schema";

@Injectable()
export class DrizzleClienteRepository implements ClienteRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async save(input: NovoClienteInput): Promise<ClienteEntity> {
    const [row] = await this.drizzleService.db
      .insert(clienteSchema)
      .values(input)
      .returning();

    return this.toEntity(row);
  }

  async saveWithPendingAccess(
    input: NovoClienteInput,
    acesso: NovoAcessoPendenteInput,
  ): Promise<ClienteEntity> {
    return this.drizzleService.db.transaction(async (tx) => {
      const [usuario] = await tx
        .insert(usuariosSchema)
        .values({
          email: acesso.email,
          password: acesso.passwordHash,
          permissions: ["CLIENTE_ACESSAR"],
          status: "PENDENTE_ATIVACAO",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      const [row] = await tx
        .insert(clienteSchema)
        .values({ ...input, usuarioId: usuario.id })
        .returning();
      await tx.insert(clienteAccessTokenSchema).values({
        usuarioId: usuario.id,
        tokenHash: acesso.tokenHash,
        expiresAt: acesso.expiresAt,
      });
      return this.toEntity({
        ...row,
        emailAcesso: usuario.email,
        statusAcesso: usuario.status,
      });
    });
  }

  async findById(id: bigint): Promise<ClienteEntity | null> {
    const [row] = await this.drizzleService.db
      .select({ cliente: clienteSchema, usuario: usuariosSchema })
      .from(clienteSchema)
      .leftJoin(usuariosSchema, eq(clienteSchema.usuarioId, usuariosSchema.id))
      .where(eq(clienteSchema.id, id))
      .limit(1);

    return row ? this.toEntity(this.flatten(row)) : null;
  }

  async findByDocumento(documento: string): Promise<ClienteEntity | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(clienteSchema)
      .where(eq(clienteSchema.documentoIdentificacao, documento))
      .limit(1);

    return row ? this.toEntity(row) : null;
  }

  async findManyPaginated(
    input: BuscarClientesPaginadoInput,
  ): Promise<BuscarClientesPaginadoResultado> {
    const where = this.buildWhere(input);
    const offset = (input.page - 1) * input.perPage;

    const [rows, [total]] = await Promise.all([
      this.drizzleService.db
        .select({ cliente: clienteSchema, usuario: usuariosSchema })
        .from(clienteSchema)
        .leftJoin(
          usuariosSchema,
          eq(clienteSchema.usuarioId, usuariosSchema.id),
        )
        .where(where)
        .limit(input.perPage)
        .offset(offset),
      this.drizzleService.db
        .select({ value: count() })
        .from(clienteSchema)
        .where(where),
    ]);

    return {
      data: rows.map((row) => this.toEntity(this.flatten(row))),
      totalItems: total?.value ?? 0,
    };
  }

  async update(
    id: bigint,
    input: AtualizarClienteInput,
  ): Promise<ClienteEntity | null> {
    const [row] = await this.drizzleService.db
      .update(clienteSchema)
      .set({ ...input, dataAtualizacao: new Date() })
      .where(eq(clienteSchema.id, id))
      .returning();

    return row ? this.findById(id) : null;
  }

  private buildWhere(input: BuscarClientesPaginadoInput): SQL | undefined {
    const { filtros } = input;
    const clauses: SQL[] = [];

    if (filtros.nome) {
      const nomeClause = or(
        ilike(clienteSchema.nome, `%${filtros.nome}%`),
        ilike(clienteSchema.razaoSocial, `%${filtros.nome}%`),
        ilike(clienteSchema.nomeFantasia, `%${filtros.nome}%`),
      );
      if (nomeClause) clauses.push(nomeClause);
    }
    if (filtros.documentoIdentificacao) {
      clauses.push(
        ilike(
          clienteSchema.documentoIdentificacao,
          `%${filtros.documentoIdentificacao}%`,
        ),
      );
    }
    if (filtros.tipoDocumento) {
      clauses.push(eq(clienteSchema.tipoDocumento, filtros.tipoDocumento));
    }
    if (filtros.email)
      clauses.push(ilike(clienteSchema.email, `%${filtros.email}%`));
    if (filtros.telefone)
      clauses.push(ilike(clienteSchema.telefone, `%${filtros.telefone}%`));
    if (filtros.origem)
      clauses.push(ilike(clienteSchema.origem, `%${filtros.origem}%`));
    if (filtros.status) clauses.push(eq(clienteSchema.status, filtros.status));

    return clauses.length > 0 ? and(...clauses) : undefined;
  }

  private toEntity(
    row: typeof clienteSchema.$inferSelect & {
      emailAcesso?: string | null;
      statusAcesso?: string | null;
    },
  ): ClienteEntity {
    return new ClienteEntity(row as ClienteEntityProps);
  }

  private flatten(row: {
    cliente: typeof clienteSchema.$inferSelect;
    usuario: typeof usuariosSchema.$inferSelect | null;
  }): typeof clienteSchema.$inferSelect & {
    emailAcesso: string | null;
    statusAcesso: string | null;
  } {
    return {
      ...row.cliente,
      emailAcesso: row.usuario?.email ?? null,
      statusAcesso: row.usuario?.status ?? null,
    };
  }
}
