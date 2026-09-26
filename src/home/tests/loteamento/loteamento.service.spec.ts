import { describe, expect, it, jest } from "@jest/globals";
import { LoteamentoService } from "@modules/loteamento/application/services/loteamento.service";
import { LoteamentoEntity } from "@modules/loteamento/domain/models/loteamento.entity";
import type { LoteamentoRepository } from "@modules/loteamento/domain/repositories/loteamento.repository";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { Mocked } from "jest-mock";

const makeRepository = (): Mocked<LoteamentoRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const loteamento = new LoteamentoEntity({
  idLoteamento: 1,
  nome: "Jardim Azul",
  descricao: "Novo bairro",
  situacao: "ativo",
  publicado: false,
  idBairro: 2,
});

describe("LoteamentoService", () => {
  it("cria com textos normalizados e referência de bairro", async () => {
    const repository = makeRepository();
    const service = new LoteamentoService(repository);
    repository.save.mockResolvedValue(loteamento);
    const input = {
      nome: " Jardim Azul ",
      descricao: " Novo bairro ",
      situacao: " ativo ",
      publicado: false,
      idBairro: 2,
    };
    await expect(service.save(input)).resolves.toBe(loteamento);
    expect(repository.save).toHaveBeenCalledWith({
      nome: "Jardim Azul",
      descricao: "Novo bairro",
      situacao: "ativo",
      publicado: false,
      idBairro: 2,
    });
  });

  it("rejeita textos vazios e id de bairro inválido", async () => {
    const service = new LoteamentoService(makeRepository());
    const input = {
      nome: "Jardim",
      descricao: "Desc",
      situacao: "ativo",
      publicado: true,
      idBairro: 2,
    };
    await expect(service.save({ ...input, nome: "  " })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.save({ ...input, idBairro: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("busca por id e lista", async () => {
    const repository = makeRepository();
    const service = new LoteamentoService(repository);
    repository.findById.mockResolvedValue(loteamento);
    repository.findMany.mockResolvedValue([loteamento]);
    await expect(service.findById("1")).resolves.toBe(loteamento);
    await expect(service.findMany()).resolves.toEqual([loteamento]);
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it("rejeita id inválido ou inexistente", async () => {
    const repository = makeRepository();
    const service = new LoteamentoService(repository);
    repository.findById.mockResolvedValue(null);
    await expect(service.findById("abc")).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.findById("2")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("atualiza somente campos enviados", async () => {
    const repository = makeRepository();
    const service = new LoteamentoService(repository);
    repository.findById.mockResolvedValue(loteamento);
    repository.update.mockResolvedValue(loteamento);
    await expect(
      service.updateById("1", { publicado: true, idBairro: 3 }),
    ).resolves.toBe(loteamento);
    expect(repository.update).toHaveBeenCalledWith(1, {
      nome: undefined,
      descricao: undefined,
      situacao: undefined,
      publicado: true,
      idBairro: 3,
    });
  });

  it("rejeita atualização inexistente", async () => {
    const repository = makeRepository();
    const service = new LoteamentoService(repository);
    repository.findById.mockResolvedValue(null);
    await expect(
      service.updateById("3", { nome: "Novo" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("remove e informa ausência", async () => {
    const repository = makeRepository();
    const service = new LoteamentoService(repository);
    repository.remove.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await expect(service.removeById("1")).resolves.toBeUndefined();
    await expect(service.removeById("2")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
