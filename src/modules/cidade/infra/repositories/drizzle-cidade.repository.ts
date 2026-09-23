import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { asc, eq } from "drizzle-orm";
import { CidadeEntity } from "../../domain/models/cidade.entity";
import type {
  AtualizarCidadeInput,
  CidadeRepository,
  NovaCidadeInput,
} from "../../domain/repositories/cidade.repository";
import { cidadeSchema } from "../schemas/cidade.schema";

type CidadeRow = typeof cidadeSchema.$inferSelect;

@Injectable()
export class DrizzleCidadeRepository implements CidadeRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async save(cidade: NovaCidadeInput): Promise<CidadeEntity> {
    const [row] = await this.drizzleService.db
      .insert(cidadeSchema)
      .values(cidade)
      .returning();

    return this.toEntity(row);
  }

  async findById(idCidade: bigint): Promise<CidadeEntity | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(cidadeSchema)
      .where(eq(cidadeSchema.idCidade, idCidade))
      .limit(1);

    return row ? this.toEntity(row) : null;
  }

  async findMany(): Promise<CidadeEntity[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(cidadeSchema)
      .orderBy(asc(cidadeSchema.nome));

    return rows.map((row) => this.toEntity(row));
  }

  async update(
    idCidade: bigint,
    input: AtualizarCidadeInput,
  ): Promise<CidadeEntity | null> {
    if (input.nome === undefined) {
      return this.findById(idCidade);
    }

    const [row] = await this.drizzleService.db
      .update(cidadeSchema)
      .set({ nome: input.nome })
      .where(eq(cidadeSchema.idCidade, idCidade))
      .returning();

    return row ? this.toEntity(row) : null;
  }

  async remove(idCidade: bigint): Promise<boolean> {
    const rows = await this.drizzleService.db
      .delete(cidadeSchema)
      .where(eq(cidadeSchema.idCidade, idCidade))
      .returning({ idCidade: cidadeSchema.idCidade });

    return rows.length > 0;
  }

  private toEntity(row: CidadeRow): CidadeEntity {
    return new CidadeEntity({
      idCidade: row.idCidade,
      nome: row.nome,
    });
  }
}
