import { describe, expect, it, jest } from "@jest/globals";
import { CreateClienteDto } from "@modules/clientes/application/dto/create-cliente.dto";
import { UpdateClienteDto } from "@modules/clientes/application/dto/update-cliente.dto";
import { ClienteService } from "@modules/clientes/application/services/cliente.service";
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
    const controller = new ClienteController(service);

    const result = await controller.findById("1");

    expect(result).toEqual(
      expect.objectContaining({
        id: "1",
        nomeExibicao: "Maria Silva",
        dataCadastro: "2026-09-27T12:00:00.000Z",
      }),
    );
    expect(result).not.toHaveProperty("usuarioId");
    expect(result).not.toHaveProperty("acesso");
  });

  it("protege desativação com permissão específica", () => {
    expect(
      Reflect.getMetadata(
        PERMISSOES_KEY,
        ClienteController.prototype.deactivate,
      ),
    ).toEqual(["CLIENTE_DESATIVAR"]);
  });

  it("preserva os DTOs em runtime para o ValidationPipe", () => {
    const createTypes = Reflect.getMetadata(
      "design:paramtypes",
      ClienteController.prototype,
      "create",
    );
    const updateTypes = Reflect.getMetadata(
      "design:paramtypes",
      ClienteController.prototype,
      "update",
    );

    expect(createTypes[0]).toBe(CreateClienteDto);
    expect(updateTypes[1]).toBe(UpdateClienteDto);
  });
});
