import { Lote } from "@modules/lote/domain/model/lote.entity";
import { LoteBuilder } from "@modules/lote/domain/builder/lote.builder";
import { loteSchema } from "../schemas/lote.schema";
import { LoteRepository } from "@modules/lote/domain/repository/lote.repository.interface";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleLoteRepository implements LoteRepository {
    constructor(private readonly drizzleService: DrizzleService) {}

    async create(lote: Lote): Promise<void> {
        console.log(lote);
        await this.drizzleService.db
            .insert(loteSchema)
            .values({
                matricula: lote.matricula,
                tipo: lote.tipo!,
                areaQuadrada: lote.areaQuadrada!,
                valor: lote.valor!,
                estado: lote.estado!,
                informacoesComplementares: lote.informacoesComplementares,
                latitude: lote.latitude!,
                longitude: lote.longitude!,
                publicado: lote.publicado!,
                idQuadra: lote.idQuadra,
                idLogradouro: lote.idLogradouro,
                idAnexo: lote.idAnexo,
                createdAt: lote.createdAt ?? new Date(),
                updatedAt: lote.updatedAt ?? new Date(),
            });
    }

    async update(lote: Lote): Promise<void> {
        await this.drizzleService.db
            .update(loteSchema)
            .set({
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
                createdAt: lote.createdAt,
                updatedAt: lote.updatedAt,
            })
            .where(eq(loteSchema.id, lote.id!));
    }

    async delete(id: bigint): Promise<void> {
        await this.drizzleService.db
            .delete(loteSchema)
            .where(eq(loteSchema.id, id));
    }

    async findAll(): Promise<Lote[]> {
        const rows = await this.drizzleService.db
            .select()
            .from(loteSchema);

        return rows.map((row) => LoteBuilder.restore(row)!);
    }

    async findById(id: bigint): Promise<Lote | null> {
        const result = await this.drizzleService.db
            .select()
            .from(loteSchema)
            .where(eq(loteSchema.id, id))
            .limit(1);

        return LoteBuilder.restore(result[0]);
    }

    async findByMatricula(matricula: string): Promise<Lote | null> {
        const result = await this.drizzleService.db
            .select()
            .from(loteSchema)
            .where(eq(loteSchema.matricula, matricula))
            .limit(1);

        return LoteBuilder.restore(result[0]);
    }

    async findByQuadra(idQuadra: bigint): Promise<Lote[]> {
        const rows = await this.drizzleService.db
            .select()
            .from(loteSchema)
            .where(eq(loteSchema.idQuadra, idQuadra));

        return rows.map((row) => LoteBuilder.restore(row)!);
    }

    async findByLogradouro(idLogradouro: bigint): Promise<Lote[]> {
        const rows = await this.drizzleService.db
            .select()
            .from(loteSchema)
            .where(eq(loteSchema.idLogradouro, idLogradouro));

        return rows.map((row) => LoteBuilder.restore(row)!);
    }

}