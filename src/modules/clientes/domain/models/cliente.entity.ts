export enum TipoDocumentoCliente {
  CPF = "CPF",
  CNPJ = "CNPJ",
}

export enum StatusCliente {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}

export interface ContatoComercial {
  id?: string;
  data: string;
  canal: string;
  responsavel: string;
  imovelId: string | null;
  assunto: string;
  resultado: string;
}

export interface ClienteEntityProps {
  id?: bigint;
  tipoDocumento: TipoDocumentoCliente;
  documentoIdentificacao: string;
  nome?: string | null;
  razaoSocial?: string | null;
  nomeFantasia?: string | null;
  telefone?: string | null;
  email?: string | null;
  origem?: string | null;
  celular?: string | null;
  rg?: string | null;
  dataNascimento?: string | null;
  estadoCivil?: string | null;
  profissao?: string | null;
  responsavel?: string | null;
  imovelInteresseId?: string | null;
  enderecoCep?: string | null;
  enderecoLogradouro?: string | null;
  enderecoNumero?: string | null;
  enderecoComplemento?: string | null;
  enderecoBairro?: string | null;
  enderecoCidade?: string | null;
  enderecoUf?: string | null;
  enderecoPais?: string | null;
  contatos?: ContatoComercial[];
  status?: StatusCliente;
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
  readonly telefone: string | null;
  readonly email: string | null;
  readonly origem: string | null;
  readonly celular: string | null;
  readonly rg: string | null;
  readonly dataNascimento: string | null;
  readonly estadoCivil: string | null;
  readonly profissao: string | null;
  readonly responsavel: string | null;
  readonly imovelInteresseId: string | null;
  readonly enderecoCep: string | null;
  readonly enderecoLogradouro: string | null;
  readonly enderecoNumero: string | null;
  readonly enderecoComplemento: string | null;
  readonly enderecoBairro: string | null;
  readonly enderecoCidade: string | null;
  readonly enderecoUf: string | null;
  readonly enderecoPais: string | null;
  readonly contatos: ContatoComercial[];
  readonly status: StatusCliente;
  readonly dataCadastro: Date;
  readonly dataAtualizacao: Date;

  constructor(props: ClienteEntityProps) {
    this.id = props.id;
    this.tipoDocumento = props.tipoDocumento;
    this.documentoIdentificacao = props.documentoIdentificacao;
    this.nome = props.nome ?? null;
    this.razaoSocial = props.razaoSocial ?? null;
    this.nomeFantasia = props.nomeFantasia ?? null;
    this.telefone = props.telefone ?? null;
    this.email = props.email ?? null;
    this.origem = props.origem ?? null;
    this.celular = props.celular ?? null;
    this.rg = props.rg ?? null;
    this.dataNascimento = props.dataNascimento ?? null;
    this.estadoCivil = props.estadoCivil ?? null;
    this.profissao = props.profissao ?? null;
    this.responsavel = props.responsavel ?? null;
    this.imovelInteresseId = props.imovelInteresseId ?? null;
    this.enderecoCep = props.enderecoCep ?? null;
    this.enderecoLogradouro = props.enderecoLogradouro ?? null;
    this.enderecoNumero = props.enderecoNumero ?? null;
    this.enderecoComplemento = props.enderecoComplemento ?? null;
    this.enderecoBairro = props.enderecoBairro ?? null;
    this.enderecoCidade = props.enderecoCidade ?? null;
    this.enderecoUf = props.enderecoUf ?? null;
    this.enderecoPais = props.enderecoPais ?? null;
    this.contatos = props.contatos ?? [];
    this.status = props.status ?? StatusCliente.ATIVO;
    this.dataCadastro = props.dataCadastro ?? new Date();
    this.dataAtualizacao = props.dataAtualizacao ?? new Date();
  }

  get nomeExibicao(): string {
    return this.tipoDocumento === TipoDocumentoCliente.CPF
      ? (this.nome ?? "")
      : (this.nomeFantasia ?? this.razaoSocial ?? "");
  }
}
