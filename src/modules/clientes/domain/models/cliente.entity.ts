export enum TipoDocumentoCliente {
  CPF = "CPF",
  CNPJ = "CNPJ",
}

export enum StatusCliente {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}

export interface ClienteEntityProps {
  id?: bigint;
  tipoDocumento: TipoDocumentoCliente;
  documentoIdentificacao: string;
  nome?: string | null;
  razaoSocial?: string | null;
  nomeFantasia?: string | null;
  telefone: string;
  email?: string | null;
  origem?: string | null;
  status?: StatusCliente;
  usuarioId?: bigint | null;
  dataCadastro?: Date;
  dataAtualizacao?: Date;
}

export class ClienteEntity {
  readonly id?: bigint;
  readonly tipoDocumento: TipoDocumentoCliente;
  readonly documentoIdentificacao: string;
  readonly nome: string | null;
  readonly razaoSocial: string | null;
  readonly nomeFantasia: string | null;
  readonly telefone: string;
  readonly email: string | null;
  readonly origem: string | null;
  readonly status: StatusCliente;
  readonly usuarioId: bigint | null;
  readonly dataCadastro: Date;
  readonly dataAtualizacao: Date;

  constructor(props: ClienteEntityProps) {
    this.id = props.id;
    this.tipoDocumento = props.tipoDocumento;
    this.documentoIdentificacao = props.documentoIdentificacao;
    this.nome = props.nome ?? null;
    this.razaoSocial = props.razaoSocial ?? null;
    this.nomeFantasia = props.nomeFantasia ?? null;
    this.telefone = props.telefone;
    this.email = props.email ?? null;
    this.origem = props.origem ?? null;
    this.status = props.status ?? StatusCliente.ATIVO;
    this.usuarioId = props.usuarioId ?? null;
    this.dataCadastro = props.dataCadastro ?? new Date();
    this.dataAtualizacao = props.dataAtualizacao ?? new Date();
  }

  get nomeExibicao(): string {
    return this.tipoDocumento === TipoDocumentoCliente.CPF
      ? (this.nome ?? "")
      : (this.nomeFantasia ?? this.razaoSocial ?? "");
  }
}
