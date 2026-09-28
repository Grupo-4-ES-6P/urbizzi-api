import { CidadeService } from "@modules/cidade/application/services/cidade.service";
import {
  CidadeEntity,
  type CidadeEntityProps,
} from "@modules/cidade/domain/models/cidade.entity";
import type { CidadeRepository } from "@modules/cidade/domain/repositories/cidade.repository";
import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Mocked } from "jest-mock";

const makeCidade = (
  overrides: Partial<CidadeEntityProps> = {},
): CidadeEntity =>
  new CidadeEntity({
    idCidade: 1n,
    nome: "São Paulo",
    ...overrides,
  });

const makeRepository = (): Mocked<CidadeRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe("CidadeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve salvar cidade removendo espaços excedentes", async () => {
    const repository = makeRepository();
    const service = new CidadeService(repository);
    const cidade = makeCidade();

    repository.save.mockResolvedValue(cidade);

    await expect(service.save({ nome: "  São Paulo  " })).resolves.toBe(cidade);
    expect(repository.save).toHaveBeenCalledWith({ nome: "São Paulo" });
  });

  it("deve rejeitar nome vazio", async () => {
    const repository = makeRepository();
    const service = new CidadeService(repository);

    await expect(service.save({ nome: "   " })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("deve buscar uma cidade pelo identificador", async () => {
    const repository = makeRepository();
    const service = new CidadeService(repository);
    const cidade = makeCidade({ idCidade: 3n });

    repository.findById.mockResolvedValue(cidade);

    await expect(service.findById("3")).resolves.toBe(cidade);
    expect(repository.findById).toHaveBeenCalledWith(3n);
  });

  it("deve listar cidades", async () => {
    const repository = makeRepository();
    const service = new CidadeService(repository);
    const cidades = [makeCidade()];

    repository.findMany.mockResolvedValue(cidades);

    await expect(service.findMany()).resolves.toBe(cidades);
  });

  it("deve atualizar cidade existente", async () => {
    const repository = makeRepository();
    const service = new CidadeService(repository);
    const existente = makeCidade({ idCidade: 8n });
    const atualizada = makeCidade({ idCidade: 8n, nome: "Campinas" });

    repository.findById.mockResolvedValue(existente);
    repository.update.mockResolvedValue(atualizada);

    await expect(
      service.updateById("8", { nome: "  Campinas " }),
    ).resolves.toBe(atualizada);
    expect(repository.update).toHaveBeenCalledWith(8n, { nome: "Campinas" });
  });

  it("deve rejeitar atualização de cidade inexistente", async () => {
    const repository = makeRepository();
    const service = new CidadeService(repository);

    repository.findById.mockResolvedValue(null);

    await expect(
      service.updateById("99", { nome: "Campinas" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("deve remover cidade existente", async () => {
    const repository = makeRepository();
    const service = new CidadeService(repository);

    repository.remove.mockResolvedValue(true);

    await expect(service.removeById("5")).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(5n);
  });

  it("deve rejeitar remoção de cidade inexistente", async () => {
    const repository = makeRepository();
    const service = new CidadeService(repository);

    repository.remove.mockResolvedValue(false);

    await expect(service.removeById("5")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
