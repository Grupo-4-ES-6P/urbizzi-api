import { describe, expect, it } from "@jest/globals";
import { CreateClienteDto } from "@modules/clientes/application/dto/create-cliente.dto";
import { TipoDocumentoCliente } from "@modules/clientes/domain/models/cliente.entity";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

describe("CreateClienteDto", () => {
  it("aceita pessoa física sem email comercial", async () => {
    const dto = plainToInstance(CreateClienteDto, {
      tipoDocumento: TipoDocumentoCliente.CPF,
      documentoIdentificacao: "529.982.247-25",
      nome: "Maria Silva",
      telefone: "45999999999",
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it("exige razão social para pessoa jurídica", async () => {
    const dto = plainToInstance(CreateClienteDto, {
      tipoDocumento: TipoDocumentoCliente.CNPJ,
      documentoIdentificacao: "04.252.011/0001-10",
      telefone: "45999999999",
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "razaoSocial")).toBe(true);
  });

  it("rejeita os antigos campos de acesso", async () => {
    const dto = plainToInstance(CreateClienteDto, {
      tipoDocumento: TipoDocumentoCliente.CPF,
      documentoIdentificacao: "52998224725",
      nome: "Maria Silva",
      telefone: "45999999999",
      criarAcesso: true,
      emailAcesso: "email-invalido",
    });

    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(["emailAcesso", "criarAcesso"]));
  });
});
