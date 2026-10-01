import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { asc, eq } from "drizzle-orm";
import { LogradouroEntity } from "../../domain/models/logradouro.entity";
import type {
  AtualizarLogradouroInput,
  LogradouroRepository,
  NovoLogradouroInput,
} from "../../domain/repositories/logradouro.repository";
import { logradouroSchema } from "../schemas/logradouro.schema";

type LogradouroRow = typeof logradouroSchema.$inferSelect;

@Injectable()
export class DrizzleLogradouroRepository implements LogradouroRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async save(logradouro: NovoLogradouroInput): Promise<LogradouroEntity> {
    const [row] = await this.drizzleService.db
      .insert(logradouroSchema)
      .values(logradouro)
      .returning();

    return this.toEntity(row);
  }

  async findById(idLogradouro: bigint): Promise<LogradouroEntity | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(logradouroSchema)
      .where(eq(logradouroSchema.idLogradouro, idLogradouro))
      .limit(1);

    return row ? this.toEntity(row) : null;
  }

  async findMany(idCidade?: bigint): Promise<LogradouroEntity[]> {
    const rows = idCidade
      ? await this.drizzleService.db
          .select()
          .from(logradouroSchema)
          .where(eq(logradouroSchema.idCidade, idCidade))
          .orderBy(asc(logradouroSchema.nome))
      : await this.drizzleService.db
          .select()
          .from(logradouroSchema)
          .orderBy(asc(logradouroSchema.nome));

    return rows.map((row) => this.toEntity(row));
  }

  async update(
    idLogradouro: bigint,
    input: AtualizarLogradouroInput,
  ): Promise<LogradouroEntity | null> {
    const values: Partial<typeof logradouroSchema.$inferInsert> = {};

    if (input.nome !== undefined) {
      values.nome = input.nome;
    }

    if (input.idCidade !== undefined) {
      values.idCidade = input.idCidade;
    }

    if (Object.keys(values).length === 0) {
      return this.findById(idLogradouro);
    }

    const [row] = await this.drizzleService.db
      .update(logradouroSchema)
      .set(values)
      .where(eq(logradouroSchema.idLogradouro, idLogradouro))
      .returning();

    return row ? this.toEntity(row) : null;
  }

  async remove(idLogradouro: bigint): Promise<boolean> {
    const rows = await this.drizzleService.db
      .delete(logradouroSchema)
      .where(eq(logradouroSchema.idLogradouro, idLogradouro))
      .returning({ idLogradouro: logradouroSchema.idLogradouro });

    return rows.length > 0;
  }

  private toEntity(row: LogradouroRow): LogradouroEntity {
    return new LogradouroEntity({
      idLogradouro: row.idLogradouro,
      nome: row.nome,
      idCidade: row.idCidade,
    });
  }
}
