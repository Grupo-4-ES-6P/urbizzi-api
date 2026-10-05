import "dotenv/config";
import { PropostaService } from "@modules/proposta/application/services/proposta.service";
import { DrizzlePropostaRepository } from "@modules/proposta/infra/repositories/drizzle-proposta.repository";
import { NotFoundException } from "@nestjs/common";
import type { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const describeDatabase =
  process.env.RUN_DB_TESTS === "1" ? describe : describe.skip;

describeDatabase("Proposta PostgreSQL", () => {
  it("insere, versiona, busca e remove sem deixar tabela permanente", async () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    try {
      await pool.query(`
        CREATE TEMP TABLE proposta (
          id_proposta serial PRIMARY KEY,
          valor numeric NOT NULL,
          condicoes text NOT NULL,
          observacoes text,
          versao integer DEFAULT 1 NOT NULL,
          status text NOT NULL,
          justificativa text,
          prazo_resposta timestamp with time zone,
          data_criacao timestamp with time zone DEFAULT now() NOT NULL,
          data_venda timestamp with time zone,
          data_cancelamento timestamp with time zone,
          id_lote integer NOT NULL,
          id_usuario integer NOT NULL,
          id_cliente integer NOT NULL
        )
      `);

      const repository = new DrizzlePropostaRepository({
        db: drizzle(pool),
      } as DrizzleService);
      const service = new PropostaService(repository);

      const criada = await service.save(
        {
          valor: "120000.50",
          condicoes: "À vista",
          status: "teste",
          idLote: 2,
          idCliente: 4,
        },
        "3",
      );

      expect(criada.valor).toBe("120000.50");
      expect(criada.versao).toBe(1);
      expect(criada.dataCriacao).toBeInstanceOf(Date);
      expect(
        (await service.findById(String(criada.idProposta))).idUsuario,
      ).toBe(3);

      const atualizada = await service.updateById(String(criada.idProposta), {
        condicoes: "Parcelado",
      });
      expect(atualizada.versao).toBe(2);
      expect(atualizada.condicoes).toBe("Parcelado");
      await expect(
        repository.update(criada.idProposta, 1, { condicoes: "Antiga" }),
      ).resolves.toBeNull();
      expect(await service.findMany()).toHaveLength(1);

      await service.removeById(String(criada.idProposta));
      await expect(
        service.findById(String(criada.idProposta)),
      ).rejects.toBeInstanceOf(NotFoundException);
    } finally {
      await pool.end();
    }
  });
});
