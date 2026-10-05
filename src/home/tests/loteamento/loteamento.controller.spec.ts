import { LoteamentoService } from "@modules/loteamento/application/services/loteamento.service";
import { LoteamentoEntity } from "@modules/loteamento/domain/models/loteamento.entity";
import { LoteamentoController } from "@modules/loteamento/infra/controllers/loteamento.controller";

const loteamento = new LoteamentoEntity({
  idLoteamento: 1,
  nome: "Jardim",
  descricao: "Residencial",
  situacao: "ativo",
  publicado: true,
  idBairro: 2,
});

describe("LoteamentoController", () => {
  it("delega o CRUD e retorna somente os campos do DER", async () => {
    const service = {
      save: jest.fn().mockResolvedValue(loteamento),
      findById: jest.fn().mockResolvedValue(loteamento),
      findMany: jest.fn().mockResolvedValue([loteamento]),
      updateById: jest.fn().mockResolvedValue(loteamento),
      removeById: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<LoteamentoService>;
    const controller = new LoteamentoController(service);
    const input = {
      nome: "Jardim",
      descricao: "Residencial",
      situacao: "ativo",
      publicado: true,
      idBairro: 2,
    };
    const expected = { idLoteamento: 1, ...input };
    await expect(controller.save(input)).resolves.toEqual(expected);
    await expect(controller.findById("1")).resolves.toEqual(expected);
    await expect(controller.findMany()).resolves.toEqual([expected]);
    await expect(controller.update("1", { publicado: true })).resolves.toEqual(
      expected,
    );
    await expect(controller.remove("1")).resolves.toBeUndefined();
    expect(service.removeById).toHaveBeenCalledWith("1");
  });
});
