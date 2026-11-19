export interface UsuarioAuthEntityProps {
  id: bigint;
  name: string;
  email: string;
  senhaHash: string;
  anexoId: bigint | null;
  permissoes: string[];
  status: string;
}

export class UsuarioAuthEntity {
  id: bigint;
  name: string;
  email: string;
  senhaHash: string;
  anexoId: bigint | null;
  permissoes: string[] | null;
  status: string;

  constructor(props: UsuarioAuthEntityProps) {
    this.id = props.id;
    this.name = props.name
    this.email = props.email;
    this.senhaHash = props.senhaHash;
    this.anexoId = props.anexoId;
    this.permissoes = props.permissoes;
    this.status = props.status ?? "ATIVO";
  }
}
