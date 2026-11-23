import type { Lote } from "../model/lote.entity";

export const LOTE_REPOSITORY = Symbol("LOTE_REPOSITORY");

export interface FiltroLotes {
    idQuadra?: bigint;
    idLogradouro?: bigint;
    matricula?: string;
}

export interface LoteRepository {
    create(lote: Lote): Promise<Lote>;
    update(lote: Lote): Promise<Lote | null>;
    delete(id: bigint): Promise<void>;
    findAll(filtro?: FiltroLotes): Promise<Lote[]>;
    findById(id: bigint): Promise<Lote | null>;
    findByMatricula(matricula: string): Promise<Lote | null>;
}
