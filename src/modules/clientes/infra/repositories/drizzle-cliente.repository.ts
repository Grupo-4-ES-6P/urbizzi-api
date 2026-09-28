import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, count, eq, ilike, type SQL } from "drizzle-orm";
import {
  ClienteEntity,
  type ClienteEntityProps,
} from "../../domain/models/cliente.entity";
import type {
  AtualizarClienteInput,
  BuscarClientesPaginadoInput,
  BuscarClientesPaginadoResultado,
  ClienteRepository,
  NovoClienteInput,
} from "../../domain/repositories/cliente.repository";
import { clienteSchema } from "../schemas/cliente.schema";

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

  async findById(id: bigint): Promise<ClienteEntity | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(clienteSchema)
      .where(eq(clienteSchema.id, id))
      .limit(1);

    return row ? this.toEntity(row) : null;
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
        .select()
        .from(clienteSchema)
        .where(where)
        .limit(input.perPage)
        .offset(offset),
      this.drizzleService.db
        .select({ value: count() })
        .from(clienteSchema)
        .where(where),
    ]);

    return {
      data: rows.map((row) => this.toEntity(row)),
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

    return row ? this.toEntity(row) : null;
  }

  private buildWhere(input: BuscarClientesPaginadoInput): SQL | undefined {
    const { filtros } = input;
    const clauses: SQL[] = [];

    if (filtros.nome) {
      clauses.push(ilike(clienteSchema.nome, `%${filtros.nome}%`));
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

  private toEntity(row: typeof clienteSchema.$inferSelect): ClienteEntity {
    return new ClienteEntity(row as ClienteEntityProps);
  }
}
