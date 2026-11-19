import { StatusUsuario } from "@modules/usuarios/domain/models/usuario.entity";

export class UsuarioResponseDto {
  id!: string;
  name!: string;
  email!: string;
  status!: StatusUsuario | string;
  permissions!: string[];
  anexoId?: string | null;
}