import { AdministradorService } from "@modules/administrador/application/services/administrador.service";
import {
  AdministradorEntity,
  type AdministradorEntityProps,
} from "@modules/administrador/domain/models/administrador.entity";
import type { AdministradorRepository } from "@modules/administrador/domain/repositories/administrador.repository";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Mocked } from "jest-mock";

const makeAdministrador = (
  overrides: Partial<AdministradorEntityProps> = {},
): AdministradorEntity =>
  new AdministradorEntity({
    id: 1n,
    nome: "Administrador Teste",
    email: "admin@quadras.com",
    cnpj: "12345678000199",
    idEndereco: 10n,
    idUsuario: null,
    ...overrides,
  });

const makeRepository = (): Mocked<AdministradorRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe("AdministradorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve salvar administrador normalizando email e cnpj", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);
    const administrador = makeAdministrador({
      nome: "Joao Silva",
      email: "joao@quadras.com",
      cnpj: "12345678000199",
      idEndereco: 42n,
    });

    repository.findByEmail.mockResolvedValue(null);
    repository.findMany.mockResolvedValue([]);
    repository.save.mockResolvedValue(administrador);

    const result = await service.save({
      nome: "  Joao Silva  ",
      email: "  JOAO@QUADRAS.COM ",
      cnpj: "12.345.678/0001-99",
      idEndereco: "42",
    });

    expect(repository.findByEmail).toHaveBeenCalledWith("joao@quadras.com");
    expect(repository.findMany).toHaveBeenCalledWith({
      cnpj: "12345678000199",
    });
    expect(repository.save).toHaveBeenCalledWith({
      nome: "Joao Silva",
      email: "joao@quadras.com",
      cnpj: "12345678000199",
      idEndereco: 42n,
    });
    expect(result).toBe(administrador);
  });

  it("deve lançar conflito ao salvar com email já existente", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);

    repository.findByEmail.mockResolvedValue(makeAdministrador());

    await expect(
      service.save({
        nome: "Nome",
        email: "admin@quadras.com",
        cnpj: "12345678000199",
        idEndereco: "10",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("deve lançar conflito ao salvar com cnpj já existente", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);

    repository.findByEmail.mockResolvedValue(null);
    repository.findMany.mockResolvedValue([makeAdministrador()]);

    await expect(
      service.save({
        nome: "Nome",
        email: "novo@quadras.com",
        cnpj: "12.345.678/0001-99",
        idEndereco: "10",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("deve lançar bad request quando id for inválido", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);

    await expect(service.findById("abc")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("deve atualizar administrador com dados normalizados", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);
    const existente = makeAdministrador({
      id: 7n,
      email: "antigo@quadras.com",
    });
    const atualizado = makeAdministrador({
      id: 7n,
      nome: "Novo Nome",
      email: "novo@quadras.com",
      cnpj: "12345678000199",
      idEndereco: 22n,
    });

    repository.findById.mockResolvedValue(existente);
    repository.findByEmail.mockResolvedValue(null);
    repository.findMany.mockResolvedValue([]);
    repository.update.mockResolvedValue(atualizado);

    const result = await service.updateById("7", {
      nome: "  Novo Nome ",
      email: "  NOVO@QUADRAS.COM ",
      cnpj: "12.345.678/0001-99",
      idEndereco: "22",
    });

    expect(repository.update).toHaveBeenCalledWith(7n, {
      nome: "Novo Nome",
      email: "novo@quadras.com",
      cnpj: "12345678000199",
      idEndereco: 22n,
    });
    expect(result).toBe(atualizado);
  });

  it("deve lançar not found ao atualizar administrador inexistente", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);

    repository.findById.mockResolvedValue(null);

    await expect(service.updateById("99", {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("deve lançar conflito ao atualizar com email de outro administrador", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);

    repository.findById.mockResolvedValue(makeAdministrador({ id: 1n }));
    repository.findByEmail.mockResolvedValue(makeAdministrador({ id: 2n }));

    await expect(
      service.updateById("1", {
        email: "existente@quadras.com",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("deve remover administrador existente", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);

    repository.remove.mockResolvedValue(true);

    await expect(service.removeById("5")).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(5n);
  });

  it("deve lançar not found ao remover administrador inexistente", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);

    repository.remove.mockResolvedValue(false);

    await expect(service.removeById("5")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("deve normalizar filtros na listagem", async () => {
    const repository = makeRepository();
    const service = new AdministradorService(repository);

    repository.findMany.mockResolvedValue([]);

    await service.findMany({
      nome: "  Joao  ",
      email: "  JOAO@QUADRAS.COM  ",
      cnpj: "12.345.678/0001-99",
    });

    expect(repository.findMany).toHaveBeenCalledWith({
      nome: "Joao",
      email: "joao@quadras.com",
      cnpj: "12345678000199",
    });
  });
});
