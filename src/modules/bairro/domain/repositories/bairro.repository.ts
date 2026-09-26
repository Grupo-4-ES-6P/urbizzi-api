import type { BairroEntity, BairroEntityProps } from "../models/bairro.entity";

export const BAIRRO_REPOSITORY = Symbol("BAIRRO_REPOSITORY");

export type NovoBairroInput = Omit<BairroEntityProps, "idBairro">;

export interface AtualizarBairroInput {
  nome?: string;
  idCidade?: bigint;
}

export interface BairroRepository {
  save(bairro: NovoBairroInput): Promise<BairroEntity>;
  findById(idBairro: bigint): Promise<BairroEntity | null>;
  findMany(idCidade?: bigint): Promise<BairroEntity[]>;
  update(
    idBairro: bigint,
    input: AtualizarBairroInput,
  ): Promise<BairroEntity | null>;
  remove(idBairro: bigint): Promise<boolean>;
}
