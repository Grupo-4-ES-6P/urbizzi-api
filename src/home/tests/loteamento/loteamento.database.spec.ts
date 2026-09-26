import "dotenv/config";
import { LoteamentoService } from "@modules/loteamento/application/services/loteamento.service";
import { DrizzleLoteamentoRepository } from "@modules/loteamento/infra/repositories/drizzle-loteamento.repository";
import { NotFoundException } from "@nestjs/common";
import type { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const describeDatabase =
  process.env.RUN_DB_TESTS === "1" ? describe : describe.skip;

describeDatabase("Loteamento PostgreSQL", () => {
  it("insere, busca e remove um registro real", async () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    try {
      await pool.query(`
        CREATE TEMP TABLE loteamento (
          id_loteamento serial PRIMARY KEY,
          nome text NOT NULL,
          descricao text NOT NULL,
          situacao text NOT NULL,
          publicado boolean NOT NULL,
          id_bairro integer NOT NULL
        )
      `);

      const repository = new DrizzleLoteamentoRepository({
        db: drizzle(pool),
      } as DrizzleService);
      const service = new LoteamentoService(repository);

      const criado = await service.save({
        nome: "Teste de integração",
        descricao: "Registro temporário",
        situacao: "teste",
        publicado: false,
        idBairro: 1,
      });

      expect(criado.idLoteamento).toBeDefined();
      const id = String(criado.idLoteamento);
      expect(await service.findById(id)).toEqual(criado);
      expect(await service.findMany()).toContainEqual(criado);

      await service.removeById(id);
      await expect(service.findById(id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    } finally {
      await pool.end();
    }
  });
});
