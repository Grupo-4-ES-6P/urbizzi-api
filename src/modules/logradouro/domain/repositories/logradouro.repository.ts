import type {
  LogradouroEntity,
  LogradouroEntityProps,
} from "../models/logradouro.entity";

export const LOGRADOURO_REPOSITORY = Symbol("LOGRADOURO_REPOSITORY");

export type NovoLogradouroInput = Omit<LogradouroEntityProps, "idLogradouro">;

export interface AtualizarLogradouroInput {
  nome?: string;
  idCidade?: bigint;
}

export interface LogradouroRepository {
  save(logradouro: NovoLogradouroInput): Promise<LogradouroEntity>;
  findById(idLogradouro: bigint): Promise<LogradouroEntity | null>;
  findMany(idCidade?: bigint): Promise<LogradouroEntity[]>;
  update(
    idLogradouro: bigint,
    input: AtualizarLogradouroInput,
  ): Promise<LogradouroEntity | null>;
  remove(idLogradouro: bigint): Promise<boolean>;
}
