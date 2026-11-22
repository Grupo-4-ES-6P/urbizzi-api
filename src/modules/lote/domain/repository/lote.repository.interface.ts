import type { Lote } from "@modules/lote/domain/model/lote.entity";

export const LOTE_REPOSITORY = Symbol("LOTE_REPOSITORY");

export interface LoteRepository {
    create(lote: Lote): Promise<Lote>;
    update(lote: Lote): Promise<void>;
    delete(id: bigint): Promise<void>;
    findAll(): Promise<Lote[]>;
    findById(id: bigint): Promise<Lote | null>;
    findByMatricula(matricula: string): Promise<Lote | null>;
    findByQuadra(idQuadra: bigint): Promise<Lote[]>;
    findByLogradouro(idLogradouro: bigint): Promise<Lote[]>;
}