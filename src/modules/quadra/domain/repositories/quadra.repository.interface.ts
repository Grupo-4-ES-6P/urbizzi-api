import type { Quadra } from "../models/quadra.entity";

export const QUADRA_REPOSITORY = Symbol("QUADRA_REPOSITORY");

export interface QuadraRepository {
    create(quadra: Quadra): Promise<void>;
    update(quadra: Quadra): Promise<void>;
    delete(id: bigint): Promise<void>;
    findAll(): Promise<Quadra[]>;
    findById(id: bigint): Promise<Quadra | null>;
    findByIdentificacao(identificacao: string): Promise<Quadra | null>;
    findByLoteamento(idLoteamento: bigint): Promise<Quadra[]>;
}