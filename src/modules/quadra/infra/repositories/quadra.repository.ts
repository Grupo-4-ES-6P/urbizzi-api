import { Quadra } from "@modules/quadra/domain/models/quadra.entity";
import { QuadraBuilder } from "@modules/quadra/domain/builders/quadra.builder";
import { quadraSchema } from "../schemas/quadra.schema";
import { QuadraRepository } from "@modules/quadra/domain/repositories/quadra.repository.interface";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleQuadraRepository implements QuadraRepository {
    constructor(private readonly drizzleService: DrizzleService) {}

    async create(quadra: Quadra): Promise<void> {
        console.log(quadra);
        await this.drizzleService.db
            .insert(quadraSchema)
            .values({
            identificacao: quadra.identificacao!,
            idLoteamento: quadra.idLoteamento,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    async update(quadra: Quadra): Promise<void> {
        console.log(quadra);
        await this.drizzleService.db
            .update(quadraSchema)
            .set({
                identificacao: quadra.identificacao!,
                idLoteamento: quadra.idLoteamento,
                updatedAt: new Date(),
            })
            .where(eq(quadraSchema.id, quadra.id!));
    }

    async delete(id: bigint): Promise<void> {
        await this.drizzleService.db
            .delete(quadraSchema)
            .where(eq(quadraSchema.id, id));
    }

    async findById(id: bigint): Promise<Quadra | null> {
        const result = await this.drizzleService.db
            .select()
            .from(quadraSchema)
            .where(eq(quadraSchema.id, id))
            .limit(1);
        
            return QuadraBuilder.restore(result[0]);
    }

    async findByLoteamento(idLoteamento: bigint): Promise<Quadra[]> {
        const rows = await this.drizzleService.db
            .select()
            .from(quadraSchema)
            .where(eq(quadraSchema.idLoteamento, idLoteamento));

        return rows.map((row) => QuadraBuilder.restore(row)!);
    }

    async findAll(): Promise<Quadra[]> {
        const rows = await this.drizzleService.db
            .select()
            .from(quadraSchema);
        
            return rows.map((row) => QuadraBuilder.restore(row)!);
    }


    
}