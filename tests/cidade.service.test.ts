import { beforeEach, describe, expect, it } from "vitest";
import { HttpError } from "../src/shared/errors/http-error";
import { InMemoryCidadeRepository } from "../src/modules/cidade/repositories/in-memory-cidade.repository";
import { CidadeService } from "../src/modules/cidade/services/cidade.service";

describe("CidadeService", () => {
  let repository: InMemoryCidadeRepository;
  let service: CidadeService;

  beforeEach(() => {
    repository = new InMemoryCidadeRepository();
    service = new CidadeService(repository);
  });

  it("deve criar uma cidade", async () => {
    const cidade = await service.create({ nome: "Campinas" });

    expect(cidade).toEqual({
      idCidade: 1,
      nome: "Campinas"
    });
  });

  it("deve buscar cidade por ID", async () => {
    const created = await service.create({ nome: "Campinas" });
    const cidade = await service.findById(created.idCidade);

    expect(cidade).toEqual(created);
  });

  it("deve retornar erro quando a cidade não existir", async () => {
    await expect(service.findById(99)).rejects.toMatchObject({
      statusCode: 404,
      message: "Cidade não encontrada."
    } satisfies Partial<HttpError>);
  });

  it("deve listar cidades", async () => {
    await service.create({ nome: "Campinas" });
    await service.create({ nome: "Santos" });

    await expect(service.findAll()).resolves.toHaveLength(2);
  });

  it("deve atualizar uma cidade", async () => {
    const created = await service.create({ nome: "Campinas" });
    const updated = await service.update(created.idCidade, { nome: "Santos" });

    expect(updated).toEqual({
      idCidade: created.idCidade,
      nome: "Santos"
    });
  });

  it("deve retornar erro ao atualizar cidade inexistente", async () => {
    await expect(service.update(99, { nome: "Santos" })).rejects.toMatchObject({
      statusCode: 404,
      message: "Cidade não encontrada."
    } satisfies Partial<HttpError>);
  });

  it("deve excluir uma cidade", async () => {
    const created = await service.create({ nome: "Campinas" });

    await service.delete(created.idCidade);

    await expect(service.findById(created.idCidade)).rejects.toMatchObject({
      statusCode: 404
    });
  });

  it("deve retornar erro ao excluir cidade inexistente", async () => {
    await expect(service.delete(99)).rejects.toMatchObject({
      statusCode: 404,
      message: "Cidade não encontrada."
    } satisfies Partial<HttpError>);
  });
});
