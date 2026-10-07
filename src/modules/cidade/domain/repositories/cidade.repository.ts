import type {
  CidadeEntity,
  CidadeEntityProps,
} from "../models/cidade.entity";

export const CIDADE_REPOSITORY = Symbol("CIDADE_REPOSITORY");

export type NovaCidadeInput = Omit<CidadeEntityProps, "idCidade">;

export interface AtualizarCidadeInput {
  nome?: string;
}

export interface CidadeRepository {
  save(cidade: NovaCidadeInput): Promise<CidadeEntity>;
  findById(idCidade: bigint): Promise<CidadeEntity | null>;
  findMany(): Promise<CidadeEntity[]>;
  update(
    idCidade: bigint,
    input: AtualizarCidadeInput,
  ): Promise<CidadeEntity | null>;
  remove(idCidade: bigint): Promise<boolean>;
}
