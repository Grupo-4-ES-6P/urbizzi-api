import { PropostaService } from "@modules/proposta/application/services/proposta.service";
import { PropostaEntity } from "@modules/proposta/domain/models/proposta.entity";
import { PropostaController } from "@modules/proposta/infra/controllers/proposta.controller";

const proposta = new PropostaEntity({
  idProposta: 1,
  valor: "100000",
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

describe("PropostaController", () => {
  it("usa o usuário autenticado e serializa as datas", async () => {
    const service = {
      save: jest.fn().mockResolvedValue(proposta),
    } as unknown as jest.Mocked<PropostaService>;
    const controller = new PropostaController(service);
    const body = {
      valor: "100000",
      condicoes: "À vista",
      status: "em análise",
      idLote: 2,
      idCliente: 4,
    };
    const result = await controller.save(body, { user: { sub: "3" } } as never);
    expect(service.save).toHaveBeenCalledWith(body, "3");
    expect(result).toEqual({
      idProposta: 1,
      valor: "100000",
      condicoes: "À vista",
      observacoes: null,
      versao: 1,
      status: "em análise",
      justificativa: null,
      prazoResposta: null,
      dataCriacao: "2026-09-30T12:00:00.000Z",
      dataVenda: null,
      dataCancelamento: null,
      idLote: 2,
      idUsuario: 3,
      idCliente: 4,
    });
  });

  it("delega listagem, busca, atualização e remoção", async () => {
    const service = {
      findMany: jest.fn().mockResolvedValue([proposta]),
      findById: jest.fn().mockResolvedValue(proposta),
      updateById: jest.fn().mockResolvedValue(proposta),
      removeById: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PropostaService>;
    const controller = new PropostaController(service);
    expect(await controller.findMany()).toHaveLength(1);
    expect((await controller.findById("1")).idProposta).toBe(1);
    await controller.update("1", { condicoes: "Parcelado" });
    await controller.remove("1");
    expect(service.updateById).toHaveBeenCalledWith("1", {
      condicoes: "Parcelado",
    });
    expect(service.removeById).toHaveBeenCalledWith("1");
  });
});
