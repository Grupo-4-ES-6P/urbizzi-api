import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { asc, eq } from "drizzle-orm";
import { LoteamentoEntity } from "../../domain/models/loteamento.entity";
import type {
  AtualizarLoteamentoInput,
  LoteamentoRepository,
  NovoLoteamentoInput,
} from "../../domain/repositories/loteamento.repository";
import { loteamentoSchema } from "../schemas/loteamento.schema";

type LoteamentoRow = typeof loteamentoSchema.$inferSelect;

@Injectable()
export class DrizzleLoteamentoRepository implements LoteamentoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async save(input: NovoLoteamentoInput): Promise<LoteamentoEntity> {
    const [row] = await this.drizzle.db
      .insert(loteamentoSchema)
      .values(input)
      .returning();
    return this.toEntity(row);
  }

  async findById(id: number): Promise<LoteamentoEntity | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(loteamentoSchema)
      .where(eq(loteamentoSchema.idLoteamento, id))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async findMany(): Promise<LoteamentoEntity[]> {
    const rows = await this.drizzle.db
      .select()
      .from(loteamentoSchema)
      .orderBy(asc(loteamentoSchema.nome));
    return rows.map((row) => this.toEntity(row));
  }

  async update(
    id: number,
    input: AtualizarLoteamentoInput,
  ): Promise<LoteamentoEntity | null> {
    const values = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as AtualizarLoteamentoInput;
    if (Object.keys(values).length === 0) return this.findById(id);
    const [row] = await this.drizzle.db
      .update(loteamentoSchema)
      .set(values)
      .where(eq(loteamentoSchema.idLoteamento, id))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async remove(id: number): Promise<boolean> {
    const rows = await this.drizzle.db
      .delete(loteamentoSchema)
      .where(eq(loteamentoSchema.idLoteamento, id))
      .returning({ idLoteamento: loteamentoSchema.idLoteamento });
    return rows.length > 0;
  }

  private toEntity(row: LoteamentoRow): LoteamentoEntity {
    return new LoteamentoEntity(row);
  }
}
