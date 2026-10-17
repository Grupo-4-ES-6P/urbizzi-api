import type {
  PropostaEntity,
  PropostaEntityProps,
} from "../models/proposta.entity";

export const PROPOSTA_REPOSITORY = Symbol("PROPOSTA_REPOSITORY");

export type NovaPropostaInput = Pick<
  PropostaEntityProps,
  | "valor"
  | "condicoes"
  | "observacoes"
  | "status"
  | "justificativa"
  | "prazoResposta"
  | "idLote"
  | "idUsuario"
  | "idCliente"
>;

export type AtualizarPropostaInput = Partial<
  Pick<
    PropostaEntityProps,
    | "valor"
    | "condicoes"
    | "observacoes"
    | "status"
    | "justificativa"
    | "prazoResposta"
    | "idLote"
    | "idCliente"
  >
>;

export interface PropostaRepository {
  save(input: NovaPropostaInput): Promise<PropostaEntity>;
  findById(id: number): Promise<PropostaEntity | null>;
  findMany(): Promise<PropostaEntity[]>;
  update(
    id: number,
    expectedVersion: number,
    input: AtualizarPropostaInput,
  ): Promise<PropostaEntity | null>;
  remove(id: number): Promise<boolean>;
}
