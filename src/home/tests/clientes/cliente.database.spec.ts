import { describe, expect, it } from "@jest/globals";
import { clienteSchema } from "@modules/clientes/infra/schemas/cliente.schema";
import { getTableConfig } from "drizzle-orm/pg-core";

describe("Schema de cliente", () => {
  it("mantém documento único sem vínculo com usuário", () => {
    const config = getTableConfig(clienteSchema);
    expect(config.name).toBe("cliente");
    expect(config.indexes.map((index) => index.config.name)).toEqual(["cliente_documento_unique"]);
    expect(config.foreignKeys).toHaveLength(0);
    expect(config.columns.map((column) => column.name)).not.toContain("id_usuario");
  });
});
