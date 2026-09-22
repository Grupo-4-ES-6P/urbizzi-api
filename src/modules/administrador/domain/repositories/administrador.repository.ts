import type {
  AdministradorEntity,
  AdministradorEntityProps,
} from "../models/administrador.entity";

export interface BuscarAdministradoresFiltros {
  nome?: string;
  email?: string;
  cnpj?: string;
}

export interface AtualizarAdministradorInput {
  nome?: string;
  email?: string;
  cnpj?: string;
  idEndereco?: bigint;
}

export const ADMINISTRADOR_REPOSITORY = Symbol("ADMINISTRADOR_REPOSITORY");

export type NovoAdministradorInput = Omit<
  AdministradorEntityProps,
  "id" | "idUsuario"
>;

export interface AdministradorRepository {
  save(administrador: NovoAdministradorInput): Promise<AdministradorEntity>;
  findById(id: bigint): Promise<AdministradorEntity | null>;
  findByEmail(email: string): Promise<AdministradorEntity | null>;
  findMany(
    filtros?: BuscarAdministradoresFiltros,
  ): Promise<AdministradorEntity[]>;
  update(
    id: bigint,
    input: AtualizarAdministradorInput,
  ): Promise<AdministradorEntity | null>;
  remove(id: bigint): Promise<boolean>;
}
