import type { AnexoEntity, AnexoEntityProps } from "../models/anexo.entity";

export const ANEXO_REPOSITORY = Symbol("ANEXO_REPOSITORY");

export type NovoAnexoInput = Pick<
  AnexoEntityProps,
  "tipoArquivo" | "caminhoArquivo"
>;

export type AtualizarAnexoInput = Partial<NovoAnexoInput>;

export interface AnexoRepository {
  save(input: NovoAnexoInput): Promise<AnexoEntity>;
  findById(id: number): Promise<AnexoEntity | null>;
  findMany(): Promise<AnexoEntity[]>;
  update(id: number, input: AtualizarAnexoInput): Promise<AnexoEntity | null>;
  remove(id: number): Promise<boolean>;
}
