
import { administradorSchema } from "@modules/administrador/infra/schemas/administrador.schema";
import { loteamentoSchema } from "@modules/loteamento/infra/schemas/loteamento.schema";
import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const schema = {
  administradorSchema,
  loteamentoSchema,
  usuariosSchema,
};

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  public readonly db;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
