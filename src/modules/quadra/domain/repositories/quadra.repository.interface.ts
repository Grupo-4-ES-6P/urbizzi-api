import type { Quadra } from "../models/quadra.entity";

export const QUADRA_REPOSITORY = Symbol("QUADRA_REPOSITORY");

export interface QuadraRepository {
    create(quadra: Quadra): Promise<Quadra>;
    update(quadra: Quadra): Promise<Quadra | null>;
    delete(id: bigint): Promise<void>;
    findAll(filtro?: { idLoteamento?: bigint }): Promise<Quadra[]>;
    findById(id: bigint): Promise<Quadra | null>;
    findByIdentificacao(idLoteamento: bigint, identificacao: string): Promise<Quadra | null>;
    loteamentoExiste(idLoteamento: bigint): Promise<boolean>;
}
