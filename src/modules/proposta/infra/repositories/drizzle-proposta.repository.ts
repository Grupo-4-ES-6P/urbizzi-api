import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, asc, eq, sql } from "drizzle-orm";
import { PropostaEntity } from "../../domain/models/proposta.entity";
import type {
  AtualizarPropostaInput,
  NovaPropostaInput,
  PropostaRepository,
} from "../../domain/repositories/proposta.repository";
import { propostaSchema } from "../schemas/proposta.schema";

type PropostaRow = typeof propostaSchema.$inferSelect;

@Injectable()
export class DrizzlePropostaRepository implements PropostaRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async save(input: NovaPropostaInput): Promise<PropostaEntity> {
    const [row] = await this.drizzle.db
      .insert(propostaSchema)
      .values(input)
      .returning();
    return this.toEntity(row);
  }

  async findById(id: number): Promise<PropostaEntity | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(propostaSchema)
      .where(eq(propostaSchema.idProposta, id))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async findMany(): Promise<PropostaEntity[]> {
    const rows = await this.drizzle.db
      .select()
      .from(propostaSchema)
      .orderBy(asc(propostaSchema.idProposta));
    return rows.map((row) => this.toEntity(row));
  }

  async update(
    id: number,
    expectedVersion: number,
    input: AtualizarPropostaInput,
  ): Promise<PropostaEntity | null> {
    const [row] = await this.drizzle.db
      .update(propostaSchema)
      .set({ ...input, versao: sql`${propostaSchema.versao} + 1` })
      .where(
        and(
          eq(propostaSchema.idProposta, id),
          eq(propostaSchema.versao, expectedVersion),
        ),
      )
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async remove(id: number): Promise<boolean> {
    const rows = await this.drizzle.db
      .delete(propostaSchema)
      .where(eq(propostaSchema.idProposta, id))
      .returning({ idProposta: propostaSchema.idProposta });
    return rows.length > 0;
  }

  private toEntity(row: PropostaRow): PropostaEntity {
    return new PropostaEntity(row);
  }
}
