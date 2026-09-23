import type { Usuario } from "@modules/usuarios/domain/models/usuario.entity";

export const USUARIO_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UsuarioRepository {
  create(user: Usuario): Promise<void>;
  update(user: Usuario): Promise<void>;
  delete(id: bigint): Promise<void>;
  findAll(): Promise<Usuario[]>;
  findById(id: bigint): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
}