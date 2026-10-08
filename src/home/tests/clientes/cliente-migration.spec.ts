import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

// Run only against an explicitly supplied, disposable database ending in _test.
const url = process.env.CLIENTE_MIGRATION_TEST_URL;
const migrationTest = url ? it : it.skip;

it("mantém journal e snapshots na mesma sequência", () => {
  const folder = join(process.cwd(), "src/shared/infra/database/drizzle");
  const journal = JSON.parse(readFileSync(join(folder, "meta/_journal.json"), "utf8"));
  let previousId = "00000000-0000-0000-0000-000000000000";
  let previousTime = 0;
  for (const [index, entry] of journal.entries.entries()) {
    expect(entry.idx).toBe(index);
    expect(entry.tag.startsWith(String(index).padStart(4, "0") + "_")).toBe(true);
    expect(entry.when).toBeGreaterThan(previousTime);
    expect(readFileSync(join(folder, entry.tag + ".sql"), "utf8").length).toBeGreaterThan(0);
    const snapshot = JSON.parse(readFileSync(join(folder, "meta", String(index).padStart(4, "0") + "_snapshot.json"), "utf8"));
    expect(snapshot.prevId).toBe(previousId);
    if (index >= 2) {
      expect(snapshot.tables["public.cidade"]).toBeDefined();
      expect(snapshot.tables["public.loteamento"]).toBeDefined();
    }
    previousId = snapshot.id;
    previousTime = entry.when;
  }
});

migrationTest("desvincula clientes preservando usuários e dados comerciais", async () => {
  if (!new URL(url!).pathname.endsWith("_test")) {
    throw new Error("Use um banco descartável com nome terminado em _test.");
  }
  const db = new Client({ connectionString: url });
  const migration = (name: string) =>
    readFileSync(join(process.cwd(), "src/shared/infra/database/drizzle", name), "utf8");
  await db.connect();
  try {
    await db.query("BEGIN");
    for (const name of ["0000_modern_skrulls.sql", "0001_tricky_zarek.sql", "0002_white_fantastic_four.sql", "0003_spooky_owl.sql", "0004_dapper_sunset_bain.sql"]) {
      await db.query(migration(name));
    }
    await db.query("INSERT INTO cidade (nome) VALUES ('Cidade preservada')");
    await db.query(`INSERT INTO loteamento (nome,descricao,situacao,publicado,id_bairro)
      VALUES ('Loteamento preservado','Teste','teste',false,1)`);
    await db.query(`INSERT INTO usuarios (id,email,password,permissions,status,created_at,updated_at)
      VALUES (100,'migration@example.test','hash',ARRAY['CLIENTE_ACESSAR'],'ATIVO',now(),now())`);
    await db.query(`INSERT INTO cliente (id_cliente,tipo_documento,documento_identificacao,nome,telefone,id_usuario)
      VALUES (100,'CPF','52998224725','Cliente preservado','45999999999',100)`);
    await db.query(`INSERT INTO cliente_access_token (id_usuario,token_hash,expires_at)
      VALUES (100,'token-antigo',now() + interval '1 day')`);
    const beforeUser = (await db.query("SELECT * FROM usuarios WHERE id = 100")).rows[0];
    const beforeClient = (await db.query("SELECT * FROM cliente WHERE id_cliente = 100")).rows[0];

    await db.query(migration("0005_desvincula_cliente_usuario.sql"));

    const afterClient = (await db.query("SELECT * FROM cliente WHERE id_cliente = 100")).rows[0];
    const { id_usuario: removed, ...commercialData } = beforeClient;
    expect(removed).toBe("100");
    expect(afterClient).toEqual(commercialData);
    expect(afterClient).not.toHaveProperty("id_usuario");
    expect((await db.query("SELECT nome FROM cidade")).rows[0].nome).toBe("Cidade preservada");
    expect((await db.query("SELECT nome FROM loteamento")).rows[0].nome).toBe("Loteamento preservado");
    expect((await db.query("SELECT to_regclass('public.cliente_access_token') AS name")).rows[0].name).toBeNull();
    await db.query("UPDATE cliente SET status = 'INATIVO' WHERE id_cliente = 100");
    expect((await db.query("SELECT * FROM usuarios WHERE id = 100")).rows[0]).toEqual(beforeUser);
    await db.query(`INSERT INTO cliente (tipo_documento,documento_identificacao,nome,telefone)
      VALUES ('CPF','12345678909','Cliente independente','45999999999')`);
    expect((await db.query("SELECT count(*)::int AS total FROM usuarios")).rows[0].total).toBe(1);
  } finally {
    await db.query("ROLLBACK");
    await db.end();
  }
});
