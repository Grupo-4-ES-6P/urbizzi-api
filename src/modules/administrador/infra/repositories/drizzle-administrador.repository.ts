import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { Injectable } from "@nestjs/common";
import { and, eq, ilike, inArray, isNotNull, type SQL } from "drizzle-orm";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { AdministradorEntity } from "../../domain/models/administrador.entity";
import {
  type AdministradorRepository,
  type AtualizarAdministradorInput,
  type BuscarAdministradoresFiltros,
  type NovoAdministradorInput,
} from "../../domain/repositories/administrador.repository";
import { administradorSchema } from "../schemas/administrador.schema";

type AdministradorRow = typeof administradorSchema.$inferSelect;

@Injectable()
export class DrizzleAdministradorRepository implements AdministradorRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async save(
    administrador: NovoAdministradorInput,
  ): Promise<AdministradorEntity> {
    const [row] = await this.drizzleService.db
      .insert(administradorSchema)
      .values({
        nome: administrador.nome,
        email: administrador.email,
        cnpj: administrador.cnpj,
        idEndereco: administrador.idEndereco,
      })
      .returning();

    const [entity] = await this.toEntities([row]);
    return entity;
  }

  async findById(id: bigint): Promise<AdministradorEntity | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(administradorSchema)
      .where(eq(administradorSchema.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    const [entity] = await this.toEntities([row]);
    return entity;
  }

  async findByEmail(email: string): Promise<AdministradorEntity | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(administradorSchema)
      .where(eq(administradorSchema.email, email))
      .limit(1);

    if (!row) {
      return null;
    }

    const [entity] = await this.toEntities([row]);
    return entity;
  }

  async findMany(
    filtros: BuscarAdministradoresFiltros = {},
  ): Promise<AdministradorEntity[]> {
    const whereClauses: SQL[] = [];

    if (filtros.nome) {
      whereClauses.push(ilike(administradorSchema.nome, `%${filtros.nome}%`));
    }

    if (filtros.email) {
      whereClauses.push(ilike(administradorSchema.email, `%${filtros.email}%`));
    }

    if (filtros.cnpj) {
      whereClauses.push(ilike(administradorSchema.cnpj, `%${filtros.cnpj}%`));
    }

    const rows = await this.drizzleService.db
      .select()
      .from(administradorSchema)
      .where(whereClauses.length > 0 ? and(...whereClauses) : undefined);

    return this.toEntities(rows);
  }

  async update(
    id: bigint,
    input: AtualizarAdministradorInput,
  ): Promise<AdministradorEntity | null> {
    const values: Partial<typeof administradorSchema.$inferInsert> = {};

    if (input.nome !== undefined) {
      values.nome = input.nome;
    }

    if (input.email !== undefined) {
      values.email = input.email;
    }

    if (input.cnpj !== undefined) {
      values.cnpj = input.cnpj;
    }

    if (input.idEndereco !== undefined) {
      values.idEndereco = input.idEndereco;
    }

    if (Object.keys(values).length === 0) {
      return this.findById(id);
    }

    const [row] = await this.drizzleService.db
      .update(administradorSchema)
      .set(values)
      .where(eq(administradorSchema.id, id))
      .returning();

    if (!row) {
      return null;
    }

    const [entity] = await this.toEntities([row]);
    return entity;
  }

  async remove(id: bigint): Promise<boolean> {
    const rows = await this.drizzleService.db
      .delete(administradorSchema)
      .where(eq(administradorSchema.id, id))
      .returning({ id: administradorSchema.id });

    return rows.length > 0;
  }

  private async toEntities(
    rows: AdministradorRow[],
  ): Promise<AdministradorEntity[]> {
    if (rows.length === 0) {
      return [];
    }

    const adminIds = rows.map((row) => row.id);

    const usuarios = await this.drizzleService.db
      .select({
        id: usuariosSchema.id,
        idAdministrador: usuariosSchema.administradorId,
      })
      .from(usuariosSchema)
      .where(
        and(
          isNotNull(usuariosSchema.administradorId),
          inArray(usuariosSchema.administradorId, adminIds),
        ),
      );

    const usuarioIdPorAdministrador = new Map<bigint, bigint>();

    for (const usuario of usuarios) {
      if (
        usuario.idAdministrador !== null &&
        !usuarioIdPorAdministrador.has(usuario.idAdministrador)
      ) {
        usuarioIdPorAdministrador.set(usuario.idAdministrador, usuario.id);
      }
    }

    return rows.map(
      (row) =>
        new AdministradorEntity({
          id: row.id,
          nome: row.nome,
          email: row.email,
          cnpj: row.cnpj,
          idEndereco: row.idEndereco,
          idUsuario: usuarioIdPorAdministrador.get(row.id) ?? null,
        }),
    );
  }
}
