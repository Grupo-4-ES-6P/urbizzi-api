import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, eq } from "drizzle-orm";
import type { Perfil } from "../../domain/permissoes.catalogo";
import type {
  PerfilPermissaoItem,
  PerfilPermissaoRepository,
} from "../../domain/repositories/perfil-permissao.repository";
import { perfilPermissaoSchema } from "../schemas/perfil-permissao.schema";

@Injectable()
export class DrizzlePerfilPermissaoRepository
  implements PerfilPermissaoRepository
{
  constructor(private readonly drizzleService: DrizzleService) {}

  async findAll(): Promise<PerfilPermissaoItem[]> {
    const linhas = await this.drizzleService.db
      .select()
      .from(perfilPermissaoSchema);
    return linhas.map((linha) => ({
      perfil: linha.perfil as Perfil,
      permissao: linha.permissao,
    }));
  }

  async isEmpty(): Promise<boolean> {
    const linhas = await this.drizzleService.db
      .select()
      .from(perfilPermissaoSchema)
      .limit(1);
    return linhas.length === 0;
  }

  async insertMany(itens: PerfilPermissaoItem[]): Promise<void> {
    if (itens.length === 0) return;
    await this.drizzleService.db
      .insert(perfilPermissaoSchema)
      .values(itens)
      .onConflictDoNothing();
  }

  async remove(item: PerfilPermissaoItem): Promise<void> {
    await this.drizzleService.db
      .delete(perfilPermissaoSchema)
      .where(
        and(
          eq(perfilPermissaoSchema.perfil, item.perfil),
          eq(perfilPermissaoSchema.permissao, item.permissao),
        ),
      );
  }
}
