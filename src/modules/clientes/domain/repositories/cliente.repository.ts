import type {
  ClienteEntity,
  ClienteEntityProps,
  StatusCliente,
  TipoDocumentoCliente,
} from "../models/cliente.entity";

export const CLIENTE_REPOSITORY = Symbol("CLIENTE_REPOSITORY");

export interface BuscarClientesFiltros {
  nome?: string;
  documentoIdentificacao?: string;
  tipoDocumento?: TipoDocumentoCliente;
  email?: string;
  telefone?: string;
  origem?: string;
  status?: StatusCliente;
}

export interface BuscarClientesPaginadoInput {
  filtros: BuscarClientesFiltros;
  page: number;
  perPage: number;
}

export interface BuscarClientesPaginadoResultado {
  data: ClienteEntity[];
  totalItems: number;
}

export type NovoClienteInput = Omit<
  ClienteEntityProps,
  "id" | "usuarioId" | "dataCadastro" | "dataAtualizacao"
>;

export type AtualizarClienteInput = Partial<
  Omit<ClienteEntityProps, "id" | "usuarioId" | "dataCadastro">
>;

export interface ClienteRepository {
  save(cliente: NovoClienteInput): Promise<ClienteEntity>;
  findById(id: bigint): Promise<ClienteEntity | null>;
  findByDocumento(documento: string): Promise<ClienteEntity | null>;
  findManyPaginated(
    input: BuscarClientesPaginadoInput,
  ): Promise<BuscarClientesPaginadoResultado>;
  update(
    id: bigint,
    input: AtualizarClienteInput,
  ): Promise<ClienteEntity | null>;
}
