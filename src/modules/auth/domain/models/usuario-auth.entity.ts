export interface UsuarioAuthEntityProps {
  id: bigint;
  email: string;
  senhaHash: string;
  idJogador: bigint | null;
  idAdministrador: bigint | null;
  permissoes: string[] | null;
}

export class UsuarioAuthEntity {
  readonly id: bigint;
  readonly email: string;
  readonly senhaHash: string;
  readonly idJogador: bigint | null;
  readonly idAdministrador: bigint | null;
  readonly permissoes: string[] | null;

  constructor(props: UsuarioAuthEntityProps) {
    this.id = props.id;
    this.email = props.email;
    this.senhaHash = props.senhaHash;
    this.idJogador = props.idJogador;
    this.idAdministrador = props.idAdministrador;
    this.permissoes = props.permissoes;
  }
}
