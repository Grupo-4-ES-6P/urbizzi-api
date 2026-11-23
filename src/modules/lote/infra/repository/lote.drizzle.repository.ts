import { LoteBuilder } from "@modules/lote/domain/builder/lote.builder";
import type { Lote } from "@modules/lote/domain/model/lote.entity";
import type { FiltroLotes, LoteRepository } from "@modules/lote/domain/repository/lote.repository.interface";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, asc, eq, type SQL } from "drizzle-orm";
import { loteSchema } from "../schemas/lote.schema";

@Injectable()
export class DrizzleLoteRepository implements LoteRepository {
    constructor(private readonly drizzleService: DrizzleService) {}

    private valores(lote: Lote) {
        return {
            matricula: lote.matricula,
            tipo: lote.tipo,
            areaQuadrada: lote.areaQuadrada,
            valor: lote.valor,
            estado: lote.estado,
            informacoesComplementares: lote.informacoesComplementares,
            latitude: lote.latitude,
            longitude: lote.longitude,
            publicado: lote.publicado,
            idQuadra: lote.idQuadra,
            idLogradouro: lote.idLogradouro,
            idAnexo: lote.idAnexo,
            detalhes: lote.detalhes,
        };
    }

    async create(lote: Lote): Promise<Lote> {
        const [row] = await this.drizzleService.db
            .insert(loteSchema)
            .values({ ...this.valores(lote), createdAt: new Date(), updatedAt: new Date() })
            .returning();
        return LoteBuilder.restore(row)!;
    }

    async update(lote: Lote): Promise<Lote | null> {
        const [row] = await this.drizzleService.db
            .update(loteSchema)
            .set({ ...this.valores(lote), updatedAt: new Date() })
            .where(eq(loteSchema.id, lote.id!))
            .returning();
        return LoteBuilder.restore(row);
    }

    async delete(id: bigint): Promise<void> {
        await this.drizzleService.db.delete(loteSchema).where(eq(loteSchema.id, id));
    }

    async findAll(filtro: FiltroLotes = {}): Promise<Lote[]> {
        const condicoes: SQL[] = [];
        if (filtro.idQuadra) condicoes.push(eq(loteSchema.idQuadra, filtro.idQuadra));
        if (filtro.idLogradouro) condicoes.push(eq(loteSchema.idLogradouro, filtro.idLogradouro));
        if (filtro.matricula) condicoes.push(eq(loteSchema.matricula, filtro.matricula));

        const rows = await this.drizzleService.db
            .select()
            .from(loteSchema)
            .where(condicoes.length ? and(...condicoes) : undefined)
            .orderBy(asc(loteSchema.id));
        return rows.map((row) => LoteBuilder.restore(row)!);
    }

    async findById(id: bigint): Promise<Lote | null> {
        const [row] = await this.drizzleService.db
            .select()
            .from(loteSchema)
            .where(eq(loteSchema.id, id))
            .limit(1);
        return LoteBuilder.restore(row);
    }

    async findByMatricula(matricula: string): Promise<Lote | null> {
        const [row] = await this.drizzleService.db
            .select()
            .from(loteSchema)
            .where(eq(loteSchema.matricula, matricula))
            .limit(1);
        return LoteBuilder.restore(row);
    }
}
