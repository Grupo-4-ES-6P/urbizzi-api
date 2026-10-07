export interface LoteamentoEntityProps {
  idLoteamento?: number;
  nome: string;
  descricao: string;
  situacao: string;
  publicado: boolean;
  idBairro: number;
}

export class LoteamentoEntity {
  readonly idLoteamento?: number;
  readonly nome: string;
  readonly descricao: string;
  readonly situacao: string;
  readonly publicado: boolean;
  readonly idBairro: number;

  constructor(props: LoteamentoEntityProps) {
    this.idLoteamento = props.idLoteamento;
    this.nome = props.nome;
    this.descricao = props.descricao;
    this.situacao = props.situacao;
    this.publicado = props.publicado;
    this.idBairro = props.idBairro;
  }
}
