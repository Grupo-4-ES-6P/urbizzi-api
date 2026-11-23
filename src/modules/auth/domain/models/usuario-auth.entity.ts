import { Perfil } from "@modules/permissoes/domain/permissoes.catalogo";

export interface UsuarioAuthEntityProps {
  id: bigint;
  name: string;
  email: string;
  senhaHash: string;
  anexoId: bigint | null;
  permissoes: string[] | null;
  status: string;
  perfil?: Perfil;
  trocarSenha?: boolean;
}

export class UsuarioAuthEntity {
  id: bigint;
  name: string;
  email: string;
  senhaHash: string;
  anexoId: bigint | null;
  permissoes: string[] | null;
  status: string;
  perfil: Perfil;
  trocarSenha: boolean;

  constructor(props: UsuarioAuthEntityProps) {
    this.id = props.id;
    this.name = props.name
    this.email = props.email;
    this.senhaHash = props.senhaHash;
    this.anexoId = props.anexoId;
    this.permissoes = props.permissoes;
    this.status = props.status ?? "ATIVO";
    this.perfil = props.perfil ?? Perfil.CORRETOR;
    this.trocarSenha = props.trocarSenha ?? false;
  }
}
