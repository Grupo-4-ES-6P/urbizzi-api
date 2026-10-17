import { describe, expect, it } from "@jest/globals";
import { ClientesModule } from "@modules/clientes/clientes.module";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";

describe("ClientesModule", () => {
  it("resolve todas as dependências do módulo", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), ClientesModule],
    }).compile();

    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
