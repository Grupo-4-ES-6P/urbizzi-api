export interface PropostaEntityProps {
  idProposta: number;
  valor: string;
  condicoes: string;
  observacoes: string | null;
  versao: number;
  status: string;
  justificativa: string | null;
  prazoResposta: Date | null;
  dataCriacao: Date;
  dataVenda: Date | null;
  dataCancelamento: Date | null;
  idLote: number;
  idUsuario: number;
  idCliente: number;
}

export class PropostaEntity {
  readonly idProposta: number;
  readonly valor: string;
  readonly condicoes: string;
  readonly observacoes: string | null;
  readonly versao: number;
  readonly status: string;
  readonly justificativa: string | null;
  readonly prazoResposta: Date | null;
  readonly dataCriacao: Date;
  readonly dataVenda: Date | null;
  readonly dataCancelamento: Date | null;
  readonly idLote: number;
  readonly idUsuario: number;
  readonly idCliente: number;

  constructor(props: PropostaEntityProps) {
    this.idProposta = props.idProposta;
    this.valor = props.valor;
    this.condicoes = props.condicoes;
    this.observacoes = props.observacoes;
    this.versao = props.versao;
    this.status = props.status;
    this.justificativa = props.justificativa;
    this.prazoResposta = props.prazoResposta;
    this.dataCriacao = props.dataCriacao;
    this.dataVenda = props.dataVenda;
    this.dataCancelamento = props.dataCancelamento;
    this.idLote = props.idLote;
    this.idUsuario = props.idUsuario;
    this.idCliente = props.idCliente;
  }
}
