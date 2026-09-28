import { clienteSchema } from "@modules/clientes/infra/schemas/cliente.schema";
import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { eq } from "drizzle-orm";
import { UsuarioAuthEntity } from "../../domain/models/usuario-auth.entity";
import type { AuthUsuarioRepository } from "../../domain/repositories/auth-usuario.repository";

@Injectable()
export class DrizzleAuthUsuarioRepository implements AuthUsuarioRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findByEmail(email: string): Promise<UsuarioAuthEntity | null> {
    const [result] = await this.drizzleService.db
      .select({ usuario: usuariosSchema, idCliente: clienteSchema.id })
      .from(usuariosSchema)
      .leftJoin(clienteSchema, eq(clienteSchema.usuarioId, usuariosSchema.id))
      .where(eq(usuariosSchema.email, email))
      .limit(1);

    if (!result) {
      return null;
    }

    const { usuario } = result;

    return new UsuarioAuthEntity({
      id: usuario.id,
      email: usuario.email,
      senhaHash: usuario.password,
      idJogador: usuario.jogadorId,
      idAdministrador: usuario.administradorId,
      permissoes: usuario.permissions,
      status: usuario.status,
      idCliente: result.idCliente,
    });
  }
}
