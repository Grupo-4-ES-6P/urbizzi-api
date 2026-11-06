import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { asc, eq } from "drizzle-orm";
import { AnexoEntity } from "../../domain/models/anexo.entity";
import type {
  AnexoRepository,
  AtualizarAnexoInput,
  NovoAnexoInput,
} from "../../domain/repositories/anexo.repository";
import { anexoSchema } from "../schemas/anexo.schema";

type AnexoRow = typeof anexoSchema.$inferSelect;

@Injectable()
export class DrizzleAnexoRepository implements AnexoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async save(input: NovoAnexoInput): Promise<AnexoEntity> {
    const [row] = await this.drizzle.db
      .insert(anexoSchema)
      .values(input)
      .returning();
    return this.toEntity(row);
  }

  async findById(id: number): Promise<AnexoEntity | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(anexoSchema)
      .where(eq(anexoSchema.idAnexo, id))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async findMany(): Promise<AnexoEntity[]> {
    const rows = await this.drizzle.db
      .select()
      .from(anexoSchema)
      .orderBy(asc(anexoSchema.idAnexo));
    return rows.map((row) => this.toEntity(row));
  }

  async update(
    id: number,
    input: AtualizarAnexoInput,
  ): Promise<AnexoEntity | null> {
    const [row] = await this.drizzle.db
      .update(anexoSchema)
      .set(input)
      .where(eq(anexoSchema.idAnexo, id))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async remove(id: number): Promise<boolean> {
    const rows = await this.drizzle.db
      .delete(anexoSchema)
      .where(eq(anexoSchema.idAnexo, id))
      .returning({ idAnexo: anexoSchema.idAnexo });
    return rows.length > 0;
  }

  private toEntity(row: AnexoRow): AnexoEntity {
    return new AnexoEntity(row);
  }
}
