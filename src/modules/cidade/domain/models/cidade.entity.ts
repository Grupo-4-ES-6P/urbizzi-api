export interface CidadeEntityProps {
  idCidade?: bigint;
  nome: string;
}

export class CidadeEntity {
  readonly idCidade?: bigint;
  readonly nome: string;

  constructor(props: CidadeEntityProps) {
    this.idCidade = props.idCidade;
    this.nome = props.nome;
  }
}
