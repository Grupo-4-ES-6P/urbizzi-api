import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { eq } from "drizzle-orm";
import { UsuarioAuthEntity } from "../../domain/models/usuario-auth.entity";
import type { AuthUsuarioRepository } from "../../domain/repositories/auth-usuario.repository";
import { UsuarioAuthBuilder } from "@modules/auth/domain/builder/usuario-auth.builder";

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

    return new UsuarioAuthBuilder(usuario.id)
      .withName(usuario.name)
      .withEmail(usuario.email)
      .withHashPassword(usuario.password)
      .withAnexoId(usuario.anexoId)
      .withPermissions(usuario.permissions)
      .withStatus(usuario.status)
      .build();
  }
}
