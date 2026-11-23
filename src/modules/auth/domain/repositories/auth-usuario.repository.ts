import type { UsuarioAuthEntity } from "../models/usuario-auth.entity";

export const AUTH_USUARIO_REPOSITORY = Symbol("AUTH_USUARIO_REPOSITORY");

export interface AuthUsuarioRepository {
  findByEmail(email: string): Promise<UsuarioAuthEntity | null>;
  registrarAcesso(id: bigint): Promise<void>;
  findById(id: bigint): Promise<UsuarioAuthEntity | null>;
  atualizarSenha(id: bigint, senhaHash: string): Promise<void>;
}
