import type { Quadra } from "../models/quadra.entity";

export const QUADRA_REPOSITORY = Symbol("QUADRA_REPOSITORY");

export interface QuadraRepository {
    create(quadra: Quadra): Promise<void>;
    update(quadra: Quadra): Promise<void>;
    delete(quadra: Quadra): Promise<void>;
    findAll(): Promise<Quadra[]>;
    findById(id: bigint): Promise<Quadra | null>;
}