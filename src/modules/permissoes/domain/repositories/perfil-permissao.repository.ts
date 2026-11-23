import type { Perfil } from "../permissoes.catalogo";

export const PERFIL_PERMISSAO_REPOSITORY = Symbol("PERFIL_PERMISSAO_REPOSITORY");

export interface PerfilPermissaoItem {
  perfil: Perfil;
  permissao: string;
}

export interface PerfilPermissaoRepository {
  findAll(): Promise<PerfilPermissaoItem[]>;
  isEmpty(): Promise<boolean>;
  insertMany(itens: PerfilPermissaoItem[]): Promise<void>;
  remove(item: PerfilPermissaoItem): Promise<void>;
}
