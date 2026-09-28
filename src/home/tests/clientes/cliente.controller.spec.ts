import { describe, expect, it, jest } from "@jest/globals";
import { ClienteService } from "@modules/clientes/application/services/cliente.service";
import { ClienteAccessService } from "@modules/clientes/application/services/cliente-access.service";
import {
  ClienteEntity,
  TipoDocumentoCliente,
} from "@modules/clientes/domain/models/cliente.entity";
import { ClienteController } from "@modules/clientes/infra/controllers/cliente.controller";
import { PERMISSOES_KEY } from "@shared/decorators/permissoes.decorator";
import type { Mocked } from "jest-mock";

const cliente = new ClienteEntity({
  id: 1n,
  tipoDocumento: TipoDocumentoCliente.CPF,
  documentoIdentificacao: "52998224725",
  nome: "Maria Silva",
  telefone: "45999999999",
  dataCadastro: new Date("2026-09-27T12:00:00Z"),
  dataAtualizacao: new Date("2026-09-27T12:00:00Z"),
});

describe("ClienteController", () => {
  it("serializa bigint e datas na consulta por ID", async () => {
    const service = {
      findById: jest.fn().mockResolvedValue(cliente),
    } as unknown as Mocked<ClienteService>;
    const controller = new ClienteController(
      service,
      {} as Mocked<ClienteAccessService>,
    );

    const result = await controller.findById("1");

    expect(result).toEqual(
      expect.objectContaining({
        id: "1",
        nomeExibicao: "Maria Silva",
        dataCadastro: "2026-09-27T12:00:00.000Z",
        acesso: null,
      }),
    );
  });

  it("protege desativação com permissão específica", () => {
    expect(
      Reflect.getMetadata(
        PERMISSOES_KEY,
        ClienteController.prototype.deactivate,
      ),
    ).toEqual(["CLIENTE_DESATIVAR"]);
  });
});
