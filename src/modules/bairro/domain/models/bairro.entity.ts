export interface BairroEntityProps {
  idBairro?: bigint;
  nome: string;
  idCidade: bigint;
}

export class BairroEntity {
  readonly idBairro?: bigint;
  readonly nome: string;
  readonly idCidade: bigint;

  constructor(props: BairroEntityProps) {
    this.idBairro = props.idBairro;
    this.nome = props.nome;
    this.idCidade = props.idCidade;
  }
}
