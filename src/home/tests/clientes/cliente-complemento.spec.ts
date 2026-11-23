import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CreateClienteDto } from "@modules/clientes/application/dto/create-cliente.dto";
import { ClienteService } from "@modules/clientes/application/services/cliente.service";
import {
  ClienteEntity,
  TipoDocumentoCliente,
} from "@modules/clientes/domain/models/cliente.entity";
import type { ClienteRepository } from "@modules/clientes/domain/repositories/cliente.repository";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { Mocked } from "jest-mock";

const contato = {
  data: "2026-11-20",
  canal: "WhatsApp",
  responsavel: "Arthur Pacheco",
  imovelId: "",
  assunto: "Primeiro contato",
  resultado: "novo" as const,
};

const makeRepository = (): Mocked<ClienteRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByDocumento: jest.fn(),
  findManyPaginated: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findContatos: jest.fn<ClienteRepository["findContatos"]>().mockResolvedValue([]),
  replaceContatos: jest.fn(),
});

const makeCliente = (overrides: Partial<ClienteEntity> = {}) =>
  Object.assign(
    new ClienteEntity({
      id: 7n,
      tipoDocumento: TipoDocumentoCliente.CPF,
      documentoIdentificacao: "52998224725",
      nome: "Maria Silva",
      telefone: "45999999999",
    }),
    overrides,
  );

describe("ClienteService — dados complementares", () => {
  beforeEach(() => jest.clearAllMocks());

  it("aceita cliente só com celular e grava endereço e contatos", async () => {
    const repository = makeRepository();
    const service = new ClienteService(repository);
    repository.findByDocumento.mockResolvedValue(null);
    repository.save.mockResolvedValue(makeCliente({ telefone: null }));

    await service.create({
      tipoDocumento: TipoDocumentoCliente.CPF,
      documentoIdentificacao: "529.982.247-25",
      nome: "Maria Silva",
      celular: "(45) 99812-4477",
      endereco: { cep: "85851-000", logradouro: " Rua A ", uf: "pr", bairro: "Centro", cidade: "Foz" },
      contatos: [contato],
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        telefone: null,
        celular: "45998124477",
        enderecoCep: "85851000",
        enderecoLogradouro: "Rua A",
        enderecoUf: "PR",
      }),
    );
    expect(repository.replaceContatos).toHaveBeenCalledWith(7n, [
      expect.objectContaining({ canal: "WhatsApp", imovelId: null }),
    ]);
  });

  it("exige pelo menos um meio de contato", async () => {
    const service = new ClienteService(makeRepository());

    await expect(
      service.create({
        tipoDocumento: TipoDocumentoCliente.CPF,
        documentoIdentificacao: "52998224725",
        nome: "Maria Silva",
      }),
    ).rejects.toThrow(new BadRequestException("Informe pelo menos um telefone, celular ou e-mail."));
  });

  it("apaga o telefone na edição quando vier nulo, mantendo o celular", async () => {
    const repository = makeRepository();
    const service = new ClienteService(repository);
    const atual = makeCliente({ celular: "45998124477" });
    repository.findById.mockResolvedValue(atual);
    repository.update.mockResolvedValue(atual);

    await service.update("7", { telefone: null });

    expect(repository.update).toHaveBeenCalledWith(
      7n,
      expect.objectContaining({ telefone: null, celular: "45998124477" }),
    );
    expect(repository.replaceContatos).not.toHaveBeenCalled();
  });

  it("não deixa a edição remover todos os meios de contato", async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(makeCliente());

    await expect(new ClienteService(repository).update("7", { telefone: null })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("substitui os contatos quando a lista vem na edição", async () => {
    const repository = makeRepository();
    const atual = makeCliente();
    repository.findById.mockResolvedValue(atual);
    repository.update.mockResolvedValue(atual);

    await new ClienteService(repository).update("7", { contatos: [] });

    expect(repository.replaceContatos).toHaveBeenCalledWith(7n, []);
  });

  it("exclui cliente existente e recusa id desconhecido", async () => {
    const repository = makeRepository();
    const service = new ClienteService(repository);
    repository.findById.mockResolvedValueOnce(makeCliente()).mockResolvedValueOnce(null);

    await service.delete("7");
    expect(repository.delete).toHaveBeenCalledWith(7n);
    await expect(service.delete("8")).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe("CreateClienteDto — dados complementares", () => {
  it("converte campos vazios do formulário em nulo e valida o contato aninhado", async () => {
    const dto = plainToInstance(CreateClienteDto, {
      tipoDocumento: TipoDocumentoCliente.CPF,
      documentoIdentificacao: "52998224725",
      nome: "Maria Silva",
      rg: "",
      dataNascimento: "",
      contatos: [{ ...contato, resultado: "talvez" }],
    });

    const erros = await validate(dto);

    expect(dto.rg).toBeNull();
    expect(dto.dataNascimento).toBeNull();
    expect(erros.map((e) => e.property)).toEqual(["contatos"]);
  });
});
