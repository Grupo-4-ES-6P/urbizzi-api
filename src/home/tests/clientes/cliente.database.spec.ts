import { describe, expect, it } from "@jest/globals";
import { clienteSchema } from "@modules/clientes/infra/schemas/cliente.schema";
import { clienteAccessTokenSchema } from "@modules/clientes/infra/schemas/cliente-access-token.schema";
import { getTableConfig } from "drizzle-orm/pg-core";

describe("Schema de cliente", () => {
  it("define documento e usuário como associações únicas", () => {
    const config = getTableConfig(clienteSchema);
    expect(config.name).toBe("cliente");
    expect(config.indexes.map((index) => index.config.name)).toEqual(
      expect.arrayContaining([
        "cliente_documento_unique",
        "cliente_usuario_unique",
      ]),
    );
    expect(config.foreignKeys).toHaveLength(1);
  });

  it("mantém apenas um convite ativo por usuário", () => {
    const config = getTableConfig(clienteAccessTokenSchema);
    expect(config.indexes.map((index) => index.config.name)).toContain(
      "cliente_access_token_usuario_unique",
    );
    expect(config.foreignKeys).toHaveLength(1);
  });
});
