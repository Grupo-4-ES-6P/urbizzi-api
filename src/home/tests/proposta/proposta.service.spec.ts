import { describe, expect, it, jest } from "@jest/globals";
import { PropostaService } from "@modules/proposta/application/services/proposta.service";
import { PropostaEntity } from "@modules/proposta/domain/models/proposta.entity";
import type { PropostaRepository } from "@modules/proposta/domain/repositories/proposta.repository";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import type { Mocked } from "jest-mock";

const repository = (): Mocked<PropostaRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const proposta = new PropostaEntity({
  idProposta: 1,
  valor: "125000.50",
  condicoes: "À vista",
  observacoes: null,
  versao: 1,
  status: "em análise",
  justificativa: null,
  prazoResposta: null,
  dataCriacao: new Date("2026-09-30T12:00:00.000Z"),
  dataVenda: null,
  dataCancelamento: null,
  idLote: 2,
  idUsuario: 3,
  idCliente: 4,
});

const input = {
  valor: "125000.50",
  condicoes: " À vista ",
  status: " em análise ",
  idLote: 2,
  idCliente: 4,
};

describe("PropostaService", () => {
  it("cria com responsável autenticado e referências obrigatórias", async () => {
    const repo = repository();
    repo.save.mockResolvedValue(proposta);
    const service = new PropostaService(repo);

    await expect(service.save(input, "3")).resolves.toBe(proposta);
    expect(repo.save).toHaveBeenCalledWith({
      valor: "125000.50",
      condicoes: "À vista",
      observacoes: null,
      status: "em análise",
      justificativa: null,
      prazoResposta: null,
      idLote: 2,
      idUsuario: 3,
      idCliente: 4,
    });
  });

  it("rejeita valor e identificadores inválidos", async () => {
    const service = new PropostaService(repository());
    await expect(
      service.save({ ...input, valor: "abc" }, "3"),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.save({ ...input, idCliente: 0 }, "3"),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.save(input, "999999999999999999"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("busca e lista propostas", async () => {
    const repo = repository();
    repo.findById.mockResolvedValue(proposta);
    repo.findMany.mockResolvedValue([proposta]);
    const service = new PropostaService(repo);
    await expect(service.findById("1")).resolves.toBe(proposta);
    await expect(service.findMany()).resolves.toEqual([proposta]);
  });

  it("retorna 404 quando a proposta não existe", async () => {
    const repo = repository();
    repo.findById.mockResolvedValue(null);
    const service = new PropostaService(repo);
    await expect(service.findById("9")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.updateById("9", { condicoes: "Parcelado" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("atualiza usando a versão esperada", async () => {
    const repo = repository();
    repo.findById.mockResolvedValue(proposta);
    const atualizada = new PropostaEntity({
      ...proposta,
      versao: 2,
      condicoes: "Parcelado",
    });
    repo.update.mockResolvedValue(atualizada);
    const service = new PropostaService(repo);
    await expect(
      service.updateById("1", { condicoes: " Parcelado ", idCliente: 5 }),
    ).resolves.toBe(atualizada);
    expect(repo.update).toHaveBeenCalledWith(1, 1, {
      condicoes: "Parcelado",
      idCliente: 5,
    });
  });

  it("detecta atualização concorrente", async () => {
    const repo = repository();
    repo.findById.mockResolvedValue(proposta);
    repo.update.mockResolvedValue(null);
    const service = new PropostaService(repo);
    await expect(
      service.updateById("1", { condicoes: "Nova" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("remove e informa ausência", async () => {
    const repo = repository();
    repo.remove.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const service = new PropostaService(repo);
    await expect(service.removeById("1")).resolves.toBeUndefined();
    await expect(service.removeById("9")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
