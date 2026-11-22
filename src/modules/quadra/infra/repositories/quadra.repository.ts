import { loteamentoSchema } from "@modules/loteamento/infra/schemas/loteamento.schema";
import { QuadraBuilder } from "@modules/quadra/domain/builders/quadra.builder";
import type { Quadra } from "@modules/quadra/domain/models/quadra.entity";
import type { QuadraRepository } from "@modules/quadra/domain/repositories/quadra.repository.interface";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, asc, eq } from "drizzle-orm";
import { quadraSchema } from "../schemas/quadra.schema";

@Injectable()
export class DrizzleQuadraRepository implements QuadraRepository {
    constructor(private readonly drizzleService: DrizzleService) {}

    async create(quadra: Quadra): Promise<Quadra> {
        const [row] = await this.drizzleService.db
            .insert(quadraSchema)
            .values({
                identificacao: quadra.identificacao,
                idLoteamento: quadra.idLoteamento,
                area: quadra.area,
                testadaPara: quadra.testadaPara,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();
        return QuadraBuilder.restore(row)!;
    }

    async update(quadra: Quadra): Promise<Quadra | null> {
        const [row] = await this.drizzleService.db
            .update(quadraSchema)
            .set({
                identificacao: quadra.identificacao,
                idLoteamento: quadra.idLoteamento,
                area: quadra.area,
                testadaPara: quadra.testadaPara,
                updatedAt: new Date(),
            })
            .where(eq(quadraSchema.id, quadra.id!))
            .returning();
        return QuadraBuilder.restore(row);
    }

    async delete(id: bigint): Promise<void> {
        await this.drizzleService.db
            .delete(quadraSchema)
            .where(eq(quadraSchema.id, id));
    }

    async findById(id: bigint): Promise<Quadra | null> {
        const [row] = await this.drizzleService.db
            .select()
            .from(quadraSchema)
            .where(eq(quadraSchema.id, id))
            .limit(1);
        return QuadraBuilder.restore(row);
    }

    async findByIdentificacao(idLoteamento: bigint, identificacao: string): Promise<Quadra | null> {
        const [row] = await this.drizzleService.db
            .select()
            .from(quadraSchema)
            .where(
                and(
                    eq(quadraSchema.idLoteamento, idLoteamento),
                    eq(quadraSchema.identificacao, identificacao),
                ),
            )
            .limit(1);
        return QuadraBuilder.restore(row);
    }

    async findAll(filtro: { idLoteamento?: bigint } = {}): Promise<Quadra[]> {
        const rows = await this.drizzleService.db
            .select()
            .from(quadraSchema)
            .where(filtro.idLoteamento ? eq(quadraSchema.idLoteamento, filtro.idLoteamento) : undefined)
            .orderBy(asc(quadraSchema.idLoteamento), asc(quadraSchema.identificacao));
        return rows.map((row) => QuadraBuilder.restore(row)!);
    }

    async loteamentoExiste(idLoteamento: bigint): Promise<boolean> {
        const rows = await this.drizzleService.db
            .select({ id: loteamentoSchema.idLoteamento })
            .from(loteamentoSchema)
            .where(eq(loteamentoSchema.idLoteamento, Number(idLoteamento)))
            .limit(1);
        return rows.length > 0;
    }
}
