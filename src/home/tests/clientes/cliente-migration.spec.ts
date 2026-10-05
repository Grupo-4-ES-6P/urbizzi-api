import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

// Run only against an explicitly supplied, disposable database ending in _test.
const url = process.env.CLIENTE_MIGRATION_TEST_URL;
const migrationTest = url ? it : it.skip;

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
    for (const name of ["0000_modern_skrulls.sql", "0001_spooky_owl.sql", "0002_dapper_sunset_bain.sql"]) {
      await db.query(migration(name));
    }
    await db.query(`INSERT INTO usuarios (id,email,password,permissions,status,created_at,updated_at)
      VALUES (100,'migration@example.test','hash',ARRAY['CLIENTE_ACESSAR'],'ATIVO',now(),now())`);
    await db.query(`INSERT INTO cliente (id_cliente,tipo_documento,documento_identificacao,nome,telefone,id_usuario)
      VALUES (100,'CPF','52998224725','Cliente preservado','45999999999',100)`);
    await db.query(`INSERT INTO cliente_access_token (id_usuario,token_hash,expires_at)
      VALUES (100,'token-antigo',now() + interval '1 day')`);
    const beforeUser = (await db.query("SELECT * FROM usuarios WHERE id = 100")).rows[0];
    const beforeClient = (await db.query("SELECT * FROM cliente WHERE id_cliente = 100")).rows[0];

    await db.query(migration("0003_desvincula_cliente_usuario.sql"));

    const afterClient = (await db.query("SELECT * FROM cliente WHERE id_cliente = 100")).rows[0];
    const { id_usuario: removed, ...commercialData } = beforeClient;
    expect(removed).toBe("100");
    expect(afterClient).toEqual(commercialData);
    expect(afterClient).not.toHaveProperty("id_usuario");
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
