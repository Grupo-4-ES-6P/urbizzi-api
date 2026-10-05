import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ClienteService } from "@modules/clientes/application/services/cliente.service";
import {
  ClienteEntity,
  StatusCliente,
  TipoDocumentoCliente,
} from "@modules/clientes/domain/models/cliente.entity";
import type { ClienteRepository } from "@modules/clientes/domain/repositories/cliente.repository";
import { BadRequestException, ConflictException } from "@nestjs/common";
import type { Mocked } from "jest-mock";

const makeRepository = (): Mocked<ClienteRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByDocumento: jest.fn(),
  findManyPaginated: jest.fn(),
  update: jest.fn(),
});

const makeCliente = (overrides: Partial<ClienteEntity> = {}) =>
  Object.assign(
    new ClienteEntity({
      id: 1n,
      tipoDocumento: TipoDocumentoCliente.CPF,
      documentoIdentificacao: "52998224725",
      nome: "Maria Silva",
      telefone: "45999999999",
    }),
    overrides,
  );

describe("ClienteService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("cria cliente sem acesso normalizando documento e contato", async () => {
    const repository = makeRepository();
    const service = new ClienteService(repository);
    repository.findByDocumento.mockResolvedValue(null);
    repository.save.mockResolvedValue(makeCliente());

    const result = await service.create({
      tipoDocumento: TipoDocumentoCliente.CPF,
      documentoIdentificacao: "529.982.247-25",
      nome: "  Maria Silva ",
      telefone: "(45) 99999-9999",
      email: " MARIA@EXAMPLE.COM ",

    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        documentoIdentificacao: "52998224725",
        nome: "Maria Silva",
        telefone: "45999999999",
        email: "maria@example.com",
        status: StatusCliente.ATIVO,
      }),
    );
    expect(result.cliente).toEqual(makeCliente({ dataCadastro: result.cliente.dataCadastro, dataAtualizacao: result.cliente.dataAtualizacao }));
  });

  it("rejeita CPF inválido", async () => {
    const service = new ClienteService(makeRepository());
    await expect(
      service.create({
        tipoDocumento: TipoDocumentoCliente.CPF,
        documentoIdentificacao: "11111111111",
        nome: "Maria",
        telefone: "45999999999",

      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejeita documento duplicado", async () => {
    const repository = makeRepository();
    const service = new ClienteService(repository);
    repository.findByDocumento.mockResolvedValue(makeCliente());
    await expect(
      service.create({
        tipoDocumento: TipoDocumentoCliente.CPF,
        documentoIdentificacao: "52998224725",
        nome: "Maria",
        telefone: "45999999999",

      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("desativa somente o cadastro comercial", async () => {
    const repository = makeRepository();
    const service = new ClienteService(repository);
    repository.findById.mockResolvedValue(
      makeCliente({ status: StatusCliente.INATIVO }),
    );

    repository.update.mockResolvedValue(makeCliente({ status: StatusCliente.INATIVO }));
    const result = await service.deactivate("1");

    expect(repository.update).toHaveBeenCalledWith(1n, { status: StatusCliente.INATIVO });
    expect(result.status).toBe(StatusCliente.INATIVO);
  });
});
