import type {
  LoteamentoEntity,
  LoteamentoEntityProps,
} from "../models/loteamento.entity";

export const LOTEAMENTO_REPOSITORY = Symbol("LOTEAMENTO_REPOSITORY");

export type NovoLoteamentoInput = Omit<LoteamentoEntityProps, "idLoteamento">;
export type AtualizarLoteamentoInput = Partial<NovoLoteamentoInput>;

export interface LoteamentoRepository {
  save(input: NovoLoteamentoInput): Promise<LoteamentoEntity>;
  findById(id: number): Promise<LoteamentoEntity | null>;
  findMany(): Promise<LoteamentoEntity[]>;
  update(
    id: number,
    input: AtualizarLoteamentoInput,
  ): Promise<LoteamentoEntity | null>;
  remove(id: number): Promise<boolean>;
}
