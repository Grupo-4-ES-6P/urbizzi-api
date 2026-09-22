import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { UsuarioAuthEntity } from "../../domain/models/usuario-auth.entity";
import type { AuthUsuarioRepository } from "../../domain/repositories/auth-usuario.repository";
import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";

@Injectable()
export class DrizzleAuthUsuarioRepository implements AuthUsuarioRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findByEmail(email: string): Promise<UsuarioAuthEntity | null> {
    const [usuario] = await this.drizzleService.db
      .select()
      .from(usuariosSchema)
      .where(eq(usuariosSchema.email, email))
      .limit(1);

    if (!usuario) {
      return null;
    }

    return new UsuarioAuthEntity({
      id: usuario.id,
      email: usuario.email,
      senhaHash: usuario.password,
      idJogador: usuario.jogadorId,
      idAdministrador: usuario.administradorId,
      permissoes: usuario.permissions,
    });
  }
}
