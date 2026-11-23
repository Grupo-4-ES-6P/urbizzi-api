import type { NotificacaoService } from "@modules/notificacoes/application/notificacao.service";
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

const notificacoes = () => ({ notificar: jest.fn() }) as unknown as jest.Mocked<NotificacaoService>;

describe("PropostaController", () => {
  it("usa o usuário autenticado e serializa as datas", async () => {
    const service = {
      save: jest.fn().mockResolvedValue(proposta),
    } as unknown as jest.Mocked<PropostaService>;
    const controller = new PropostaController(service, notificacoes());
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
      codigo: null,
      detalhes: {},
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
    const controller = new PropostaController(service, notificacoes());
    expect(await controller.findMany()).toHaveLength(1);
    expect((await controller.findById("1")).idProposta).toBe(1);
    await controller.update("1", { condicoes: "Parcelado" });
    await controller.remove("1");
    expect(service.updateById).toHaveBeenCalledWith("1", {
      condicoes: "Parcelado",
    });
    expect(service.removeById).toHaveBeenCalledWith("1");
  });

  it("avisa quem aprova quando a proposta fica pendente e o autor quando é decidida", async () => {
    const pendente = new PropostaEntity({ ...proposta, status: "pendente", codigo: "PRP-7", idProposta: 7 });
    const aprovada = new PropostaEntity({ ...pendente, status: "aprovada", versao: 2 });
    const service = {
      save: jest.fn().mockResolvedValue(pendente),
      findById: jest.fn().mockResolvedValue(pendente),
      updateById: jest.fn().mockResolvedValue(aprovada),
    } as unknown as jest.Mocked<PropostaService>;
    const avisos = notificacoes();
    const controller = new PropostaController(service, avisos);

    await controller.save({ ...pendente, idLote: 2, idCliente: 4 } as never, { user: { sub: "3", permissoes: [] } } as never);
    expect(avisos.notificar).toHaveBeenLastCalledWith(
      expect.objectContaining({ tipo: "proposta_pendente", link: "/propostas/7", chave: "proposta-pendente:7:1" }),
      { permissao: "APROVAR_PROPOSTA", exceto: "3" },
    );

    await controller.update("7", { status: "aprovada" }, { user: { sub: "1", permissoes: ["ADMIN"] } } as never);
    expect(avisos.notificar).toHaveBeenLastCalledWith(
      expect.objectContaining({ tipo: "proposta_aprovada", mensagem: "Sua proposta PRP-7 foi aprovada." }),
      { usuarios: [3], exceto: "1" },
    );
  });
});
