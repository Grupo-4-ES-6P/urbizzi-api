import { eq } from "drizzle-orm";
import { db } from "../../../shared/infra/database/connection";
import { cidadeTable } from "../../../shared/infra/database/schemas/cidade.schema";
import { Cidade } from "../entities/cidade.entity";
import type { CidadeRepository, CidadeRepositoryData } from "./cidade.repository";

type CidadeRow = typeof cidadeTable.$inferSelect;

export class DrizzleCidadeRepository implements CidadeRepository {
  async create(data: CidadeRepositoryData): Promise<Cidade> {
    const [cidade] = await db.insert(cidadeTable).values(data).returning();

    return this.toEntity(cidade);
  }

  async findById(idCidade: number): Promise<Cidade | null> {
    const [cidade] = await db
      .select()
      .from(cidadeTable)
      .where(eq(cidadeTable.idCidade, idCidade))
      .limit(1);

    return cidade ? this.toEntity(cidade) : null;
  }

  async findAll(): Promise<Cidade[]> {
    const cidades = await db.select().from(cidadeTable).orderBy(cidadeTable.nome);

    return cidades.map((cidade) => this.toEntity(cidade));
  }

  async update(idCidade: number, data: CidadeRepositoryData): Promise<Cidade | null> {
    const [cidade] = await db
      .update(cidadeTable)
      .set(data)
      .where(eq(cidadeTable.idCidade, idCidade))
      .returning();

    return cidade ? this.toEntity(cidade) : null;
  }

  async delete(idCidade: number): Promise<boolean> {
    const deleted = await db
      .delete(cidadeTable)
      .where(eq(cidadeTable.idCidade, idCidade))
      .returning({ idCidade: cidadeTable.idCidade });

    return deleted.length > 0;
  }

  private toEntity(cidade: CidadeRow): Cidade {
    return new Cidade(cidade.idCidade, cidade.nome);
  }
}
