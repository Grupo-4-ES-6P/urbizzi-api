export interface UsuarioAuthEntityProps {
  id: bigint;
  email: string;
  senhaHash: string;
  idJogador: bigint | null;
  idAdministrador: bigint | null;
  permissoes: string[] | null;
  status?: string;
}

export class UsuarioAuthEntity {
  readonly id: bigint;
  readonly email: string;
  readonly senhaHash: string;
  readonly idJogador: bigint | null;
  readonly idAdministrador: bigint | null;
  readonly permissoes: string[] | null;
  readonly status: string;

  constructor(props: UsuarioAuthEntityProps) {
    this.id = props.id;
    this.email = props.email;
    this.senhaHash = props.senhaHash;
    this.idJogador = props.idJogador;
    this.idAdministrador = props.idAdministrador;
    this.permissoes = props.permissoes;
    this.status = props.status ?? "ATIVO";
  }
}
