import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { asc, eq } from "drizzle-orm";
import { BairroEntity } from "../../domain/models/bairro.entity";
import type {
  AtualizarBairroInput,
  BairroRepository,
  NovoBairroInput,
} from "../../domain/repositories/bairro.repository";
import { bairroSchema } from "../schemas/bairro.schema";

type BairroRow = typeof bairroSchema.$inferSelect;

@Injectable()
export class DrizzleBairroRepository implements BairroRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async save(bairro: NovoBairroInput): Promise<BairroEntity> {
    const [row] = await this.drizzleService.db
      .insert(bairroSchema)
      .values(bairro)
      .returning();

    return this.toEntity(row);
  }

  async findById(idBairro: bigint): Promise<BairroEntity | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(bairroSchema)
      .where(eq(bairroSchema.idBairro, idBairro))
      .limit(1);

    return row ? this.toEntity(row) : null;
  }

  async findMany(idCidade?: bigint): Promise<BairroEntity[]> {
    const rows = idCidade
      ? await this.drizzleService.db
          .select()
          .from(bairroSchema)
          .where(eq(bairroSchema.idCidade, idCidade))
          .orderBy(asc(bairroSchema.nome))
      : await this.drizzleService.db
          .select()
          .from(bairroSchema)
          .orderBy(asc(bairroSchema.nome));

    return rows.map((row) => this.toEntity(row));
  }

  async update(
    idBairro: bigint,
    input: AtualizarBairroInput,
  ): Promise<BairroEntity | null> {
    const values: Partial<typeof bairroSchema.$inferInsert> = {};

    if (input.nome !== undefined) {
      values.nome = input.nome;
    }

    if (input.idCidade !== undefined) {
      values.idCidade = input.idCidade;
    }

    if (Object.keys(values).length === 0) {
      return this.findById(idBairro);
    }

    const [row] = await this.drizzleService.db
      .update(bairroSchema)
      .set(values)
      .where(eq(bairroSchema.idBairro, idBairro))
      .returning();

    return row ? this.toEntity(row) : null;
  }

  async remove(idBairro: bigint): Promise<boolean> {
    const rows = await this.drizzleService.db
      .delete(bairroSchema)
      .where(eq(bairroSchema.idBairro, idBairro))
      .returning({ idBairro: bairroSchema.idBairro });

    return rows.length > 0;
  }

  private toEntity(row: BairroRow): BairroEntity {
    return new BairroEntity({
      idBairro: row.idBairro,
      nome: row.nome,
      idCidade: row.idCidade,
    });
  }
}
