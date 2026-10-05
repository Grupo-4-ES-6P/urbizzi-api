import { CidadeService } from "@modules/cidade/application/services/cidade.service";
import { CidadeEntity } from "@modules/cidade/domain/models/cidade.entity";
import { CidadeController } from "@modules/cidade/infra/controllers/cidade.controller";
import { NotFoundException } from "@nestjs/common";
import type { Mock } from "jest-mock";

type CidadeServiceMock = {
  save: Mock;
  findById: Mock;
  findMany: Mock;
  updateById: Mock;
  removeById: Mock;
};

const makeCidade = (idCidade = 1n, nome = "São Paulo") =>
  new CidadeEntity({ idCidade, nome });

const makeService = (): CidadeServiceMock => ({
  save: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  updateById: jest.fn(),
  removeById: jest.fn(),
});

describe("CidadeController", () => {
  it("deve criar cidade", async () => {
    const service = makeService();
    const controller = new CidadeController(service as unknown as CidadeService);
    const body = { nome: "São Paulo" };

    service.save.mockResolvedValue(makeCidade());

    await expect(controller.save(body)).resolves.toEqual({
      idCidade: "1",
      nome: "São Paulo",
    });
    expect(service.save).toHaveBeenCalledWith(body);
  });

  it("deve listar cidades", async () => {
    const service = makeService();
    const controller = new CidadeController(service as unknown as CidadeService);

    service.findMany.mockResolvedValue([
      makeCidade(1n, "Campinas"),
      makeCidade(2n, "São Paulo"),
    ]);

    await expect(controller.findMany()).resolves.toEqual([
      { idCidade: "1", nome: "Campinas" },
      { idCidade: "2", nome: "São Paulo" },
    ]);
  });

  it("deve buscar cidade por id", async () => {
    const service = makeService();
    const controller = new CidadeController(service as unknown as CidadeService);

    service.findById.mockResolvedValue(makeCidade(3n));

    await expect(controller.findById("3")).resolves.toEqual({
      idCidade: "3",
      nome: "São Paulo",
    });
  });

  it("deve informar cidade não encontrada", async () => {
    const service = makeService();
    const controller = new CidadeController(service as unknown as CidadeService);

    service.findById.mockResolvedValue(null);

    await expect(controller.findById("9")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("deve atualizar cidade", async () => {
    const service = makeService();
    const controller = new CidadeController(service as unknown as CidadeService);
    const body = { nome: "Campinas" };

    service.updateById.mockResolvedValue(makeCidade(4n, "Campinas"));

    await expect(controller.update("4", body)).resolves.toEqual({
      idCidade: "4",
      nome: "Campinas",
    });
    expect(service.updateById).toHaveBeenCalledWith("4", body);
  });

  it("deve remover cidade", async () => {
    const service = makeService();
    const controller = new CidadeController(service as unknown as CidadeService);

    service.removeById.mockResolvedValue(undefined);

    await expect(controller.remove("7")).resolves.toBeUndefined();
    expect(service.removeById).toHaveBeenCalledWith("7");
  });
});
