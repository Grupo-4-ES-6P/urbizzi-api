import { Usuario } from "@modules/usuarios/domain/models/usuario.entity";
import type { UsuarioRepository } from "@modules/usuarios/domain/repositories/usuario-repository.interface";
import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleUsuarioRepository implements UsuarioRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(user: Usuario): Promise<void> {
    console.log(user);
    await this.drizzleService.db.insert(usuariosSchema).values({
      email: user.email,
      password: user.password,
      jogadorId: user.jogadorId,
      administradorId: user.administradorId,
      permissions: user.permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(user: Usuario): Promise<void> {
    await this.drizzleService.db
      .update(usuariosSchema)
      .set({
        email: user.email,
        password: user.password,
        permissions: user.permissions,
        updatedAt: new Date(),
      })
      .where(eq(usuariosSchema.id, user.id!));
  }

  async delete(id: bigint): Promise<void> {
    await this.drizzleService.db
      .delete(usuariosSchema)
      .where(eq(usuariosSchema.id, id));
  }

  async findById(id: bigint): Promise<Usuario | null> {
    const result = await this.drizzleService.db
      .select()
      .from(usuariosSchema)
      .where(eq(usuariosSchema.id, id))
      .limit(1);

    return Usuario.restore(result[0]);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const result = await this.drizzleService.db
      .select()
      .from(usuariosSchema)
      .where(eq(usuariosSchema.email, email.toLowerCase()))
      .limit(1);

    return Usuario.restore(result[0]);
  }

  async findAll(): Promise<Usuario[]> {
    const rows = await this.drizzleService.db.select().from(usuariosSchema);
    return rows.map((row) => Usuario.restore(row)!);
  }
}
