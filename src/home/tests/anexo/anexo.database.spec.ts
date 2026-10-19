import "dotenv/config";
import { AnexoService } from "@modules/anexo/application/services/anexo.service";
import { DrizzleAnexoRepository } from "@modules/anexo/infra/repositories/drizzle-anexo.repository";
import { NotFoundException } from "@nestjs/common";
import type { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const describeDatabase =
  process.env.RUN_DB_TESTS === "1" ? describe : describe.skip;

describeDatabase("Anexo PostgreSQL", () => {
  it("insere, atualiza, busca e remove sem deixar tabela permanente", async () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    try {
      await pool.query(`
        CREATE TEMP TABLE anexo (
          id_anexo serial PRIMARY KEY,
          tipo_arquivo text NOT NULL,
          caminho_arquivo text NOT NULL,
          data_upload timestamp with time zone DEFAULT now() NOT NULL
        )
      `);

      const repository = new DrizzleAnexoRepository({
        db: drizzle(pool),
      } as DrizzleService);
      const service = new AnexoService(repository);

      const criado = await service.save({
        tipoArquivo: "application/pdf",
        caminhoArquivo: "lotes/2/matricula.pdf",
      });
      expect(criado.idAnexo).toBeGreaterThan(0);
      expect(criado.dataUpload).toBeInstanceOf(Date);

      const atualizado = await service.updateById(String(criado.idAnexo), {
        caminhoArquivo: "lotes/2/matricula-v2.pdf",
      });
      expect(atualizado.caminhoArquivo).toBe("lotes/2/matricula-v2.pdf");
      expect(atualizado.tipoArquivo).toBe("application/pdf");
      expect(await service.findMany()).toHaveLength(1);

      await service.removeById(String(criado.idAnexo));
      await expect(
        service.findById(String(criado.idAnexo)),
      ).rejects.toBeInstanceOf(NotFoundException);
    } finally {
      await pool.end();
    }
  });
});
