export interface AdministradorEntityProps {
  id?: bigint;
  nome: string;
  email: string;
  cnpj: string;
  idEndereco: bigint;
  idUsuario?: bigint | null;
}

export class AdministradorEntity {
  readonly id?: bigint;
  readonly nome: string;
  readonly email: string;
  readonly cnpj: string;
  readonly idEndereco: bigint;
  readonly idUsuario: bigint | null;

  constructor(props: AdministradorEntityProps) {
    this.id = props.id;
    this.nome = props.nome;
    this.email = props.email;
    this.cnpj = props.cnpj;
    this.idEndereco = props.idEndereco;
    this.idUsuario = props.idUsuario ?? null;
  }
}
