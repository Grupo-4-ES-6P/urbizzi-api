import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ClienteService } from "@modules/clientes/application/services/cliente.service";
import { ClienteAccessService } from "@modules/clientes/application/services/cliente-access.service";
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
  saveWithPendingAccess: jest.fn(),
  findById: jest.fn(),
  findByDocumento: jest.fn(),
  findManyPaginated: jest.fn(),
  update: jest.fn(),
});

const makeAccessService = (): Mocked<ClienteAccessService> =>
  ({
    preparePendingAccess: jest.fn(),
    sendInvitation: jest.fn(),
    deactivateClient: jest.fn(),
  }) as unknown as Mocked<ClienteAccessService>;

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
    const accessService = makeAccessService();
    const service = new ClienteService(repository, accessService);
    repository.findByDocumento.mockResolvedValue(null);
    repository.save.mockResolvedValue(makeCliente());

    const result = await service.create({
      tipoDocumento: TipoDocumentoCliente.CPF,
      documentoIdentificacao: "529.982.247-25",
      nome: "  Maria Silva ",
      telefone: "(45) 99999-9999",
      email: " MARIA@EXAMPLE.COM ",
      criarAcesso: false,
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
    expect(result.conviteEnviado).toBeNull();
  });

  it("cria cliente e acesso na mesma operação de repositório", async () => {
    const repository = makeRepository();
    const accessService = makeAccessService();
    const service = new ClienteService(repository, accessService);
    const pending = {
      email: "maria@example.com",
      passwordHash: "hash",
      tokenHash: "token-hash",
      expiresAt: new Date(),
      rawToken: "raw-token",
    };
    repository.findByDocumento.mockResolvedValue(null);
    repository.saveWithPendingAccess.mockResolvedValue(
      makeCliente({ usuarioId: 8n }),
    );
    accessService.preparePendingAccess.mockResolvedValue(pending);
    accessService.sendInvitation.mockResolvedValue(true);

    const result = await service.create({
      tipoDocumento: TipoDocumentoCliente.CPF,
      documentoIdentificacao: "52998224725",
      nome: "Maria",
      telefone: "45999999999",
      email: "maria@example.com",
      criarAcesso: true,
    });

    expect(repository.saveWithPendingAccess).toHaveBeenCalledWith(
      expect.any(Object),
      pending,
    );
    expect(accessService.sendInvitation).toHaveBeenCalledWith(
      "maria@example.com",
      "raw-token",
    );
    expect(result.conviteEnviado).toBe(true);
  });

  it("rejeita CPF inválido", async () => {
    const service = new ClienteService(makeRepository(), makeAccessService());
    await expect(
      service.create({
        tipoDocumento: TipoDocumentoCliente.CPF,
        documentoIdentificacao: "11111111111",
        nome: "Maria",
        telefone: "45999999999",
        criarAcesso: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejeita documento duplicado", async () => {
    const repository = makeRepository();
    const service = new ClienteService(repository, makeAccessService());
    repository.findByDocumento.mockResolvedValue(makeCliente());
    await expect(
      service.create({
        tipoDocumento: TipoDocumentoCliente.CPF,
        documentoIdentificacao: "52998224725",
        nome: "Maria",
        telefone: "45999999999",
        criarAcesso: false,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("desativa cadastro e acesso em cascata", async () => {
    const repository = makeRepository();
    const accessService = makeAccessService();
    const service = new ClienteService(repository, accessService);
    repository.findById.mockResolvedValue(
      makeCliente({ status: StatusCliente.INATIVO }),
    );

    const result = await service.deactivate("1");

    expect(accessService.deactivateClient).toHaveBeenCalledWith(1n);
    expect(result.status).toBe(StatusCliente.INATIVO);
  });
});
