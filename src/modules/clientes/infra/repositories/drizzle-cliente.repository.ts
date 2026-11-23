import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, asc, count, eq, ilike, or, type SQL } from "drizzle-orm";
import {
  ClienteEntity,
  type ClienteEntityProps,
  type ContatoComercial,
} from "../../domain/models/cliente.entity";
import type {
  AtualizarClienteInput,
  BuscarClientesPaginadoInput,
  BuscarClientesPaginadoResultado,
  ClienteRepository,
  NovoClienteInput,
} from "../../domain/repositories/cliente.repository";
import { clienteContatoSchema } from "../schemas/cliente-contato.schema";
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

    return row ? this.findById(id) : null;
  }

  async delete(id: bigint): Promise<void> {
    await this.drizzleService.db
      .delete(clienteSchema)
      .where(eq(clienteSchema.id, id));
  }

  async findContatos(idCliente: bigint): Promise<ContatoComercial[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(clienteContatoSchema)
      .where(eq(clienteContatoSchema.idCliente, idCliente))
      .orderBy(asc(clienteContatoSchema.data), asc(clienteContatoSchema.id));

    return rows.map((row) => ({
      id: row.id.toString(),
      data: row.data,
      canal: row.canal,
      responsavel: row.responsavel,
      imovelId: row.imovelId,
      assunto: row.assunto,
      resultado: row.resultado,
    }));
  }

  async replaceContatos(
    idCliente: bigint,
    contatos: ContatoComercial[],
  ): Promise<void> {
    await this.drizzleService.db.transaction(async (tx) => {
      await tx
        .delete(clienteContatoSchema)
        .where(eq(clienteContatoSchema.idCliente, idCliente));
      if (contatos.length === 0) return;
      await tx.insert(clienteContatoSchema).values(
        contatos.map((contato) => ({
          idCliente,
          data: contato.data,
          canal: contato.canal,
          responsavel: contato.responsavel,
          imovelId: contato.imovelId,
          assunto: contato.assunto,
          resultado: contato.resultado,
        })),
      );
    });
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

  private toEntity(row: typeof clienteSchema.$inferSelect): ClienteEntity {
    return new ClienteEntity(row as ClienteEntityProps);
  }
}
