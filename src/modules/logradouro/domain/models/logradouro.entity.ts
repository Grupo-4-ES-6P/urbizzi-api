export interface LogradouroEntityProps {
  idLogradouro?: bigint;
  nome: string;
  idCidade: bigint;
}

export class LogradouroEntity {
  readonly idLogradouro?: bigint;
  readonly nome: string;
  readonly idCidade: bigint;

  constructor(props: LogradouroEntityProps) {
    this.idLogradouro = props.idLogradouro;
    this.nome = props.nome;
    this.idCidade = props.idCidade;
  }
}
