import { AdministradorService } from "@modules/administrador/application/services/administrador.service";
import { AdministradorEntity } from "@modules/administrador/domain/models/administrador.entity";
import { AdministradorController } from "@modules/administrador/infra/controllers/administrador.controller";
import { NotFoundException } from "@nestjs/common";
import type { Mock } from "jest-mock";

type AdministradorServiceMock = {
  save: Mock;
  findById: Mock;
  findByEmail: Mock;
  findMany: Mock;
  findManyPaginated: Mock;
  updateById: Mock;
  removeById: Mock;
  buildPaginacaoLinks: Mock;
  buildAdministradorLinks: Mock;
};

const makeAdministrador = (overrides?: Partial<AdministradorEntity>) =>
  new AdministradorEntity({
    id: 1n,
    nome: "Administrador Teste",
    email: "admin@quadras.com",
    cnpj: "12345678000199",
    idEndereco: 10n,
    idUsuario: null,
    ...overrides,
  });

const makeService = (): AdministradorServiceMock => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findMany: jest.fn(),
  findManyPaginated: jest.fn(),
  updateById: jest.fn(),
  removeById: jest.fn(),
  buildPaginacaoLinks: jest.fn(),
  buildAdministradorLinks: jest.fn(),
});

const requestMock = {
  baseUrl: "/administradores",
};

describe("AdministradorController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve buscar por id quando query.id for informado", async () => {
    const service = makeService();
    const controller = new AdministradorController(
      service as unknown as AdministradorService,
    );
    const administrador = makeAdministrador({
      id: 3n,
      idEndereco: 20n,
    });

    service.findById.mockResolvedValue(administrador);
    service.buildAdministradorLinks.mockReturnValue({
      self: "/administradores/3",
      collection: "/administradores",
      update: "/administradores/3",
      remove: "/administradores/3",
    });

    const result = await controller.find({ id: "3" }, requestMock as never);

    expect(service.findById).toHaveBeenCalledWith("3");
    expect(result).toEqual({
      id: "3",
      nome: "Administrador Teste",
      email: "admin@quadras.com",
      cnpj: "12345678000199",
      idEndereco: "20",
      idUsuario: null,
      _links: {
        self: { href: "/administradores/3" },
        collection: { href: "/administradores" },
        update: { href: "/administradores/3" },
        remove: { href: "/administradores/3" },
      },
    });
  });

  it("deve lançar not found quando id não existir", async () => {
    const service = makeService();
    const controller = new AdministradorController(
      service as unknown as AdministradorService,
    );

    service.findById.mockResolvedValue(null);

    await expect(
      controller.find({ id: "99" }, requestMock as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("deve buscar por email quando apenas email for informado", async () => {
    const service = makeService();
    const controller = new AdministradorController(
      service as unknown as AdministradorService,
    );
    const administrador = makeAdministrador({ id: 4n, idEndereco: 55n });

    service.findByEmail.mockResolvedValue(administrador);
    service.buildAdministradorLinks.mockReturnValue({
      self: "/administradores/4",
      collection: "/administradores",
      update: "/administradores/4",
      remove: "/administradores/4",
    });

    const result = await controller.find(
      { email: "admin@quadras.com" },
      requestMock as never,
    );

    expect(service.findByEmail).toHaveBeenCalledWith("admin@quadras.com");
    expect(service.findMany).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: "4",
      nome: "Administrador Teste",
      email: "admin@quadras.com",
      cnpj: "12345678000199",
      idEndereco: "55",
      idUsuario: null,
      _links: {
        self: { href: "/administradores/4" },
        collection: { href: "/administradores" },
        update: { href: "/administradores/4" },
        remove: { href: "/administradores/4" },
      },
    });
  });

  it("deve listar administradores para filtro geral", async () => {
    const service = makeService();
    const controller = new AdministradorController(
      service as unknown as AdministradorService,
    );

    service.findManyPaginated.mockResolvedValue({
      data: [
        makeAdministrador({ id: 1n }),
        makeAdministrador({ id: 2n, email: "outro@quadras.com" }),
      ],
      paginacao: {
        page: 1,
        perPage: 10,
        totalItems: 2,
        totalPages: 1,
      },
    });
    service.buildPaginacaoLinks.mockReturnValue({
      self: "/administradores?page=1&perPage=10&nome=Adm&cnpj=123",
      first: "/administradores?page=1&perPage=10&nome=Adm&cnpj=123",
      last: "/administradores?page=1&perPage=10&nome=Adm&cnpj=123",
    });
    service.buildAdministradorLinks
      .mockReturnValueOnce({
        self: "/administradores/1",
        collection: "/administradores",
        update: "/administradores/1",
        remove: "/administradores/1",
      })
      .mockReturnValueOnce({
        self: "/administradores/2",
        collection: "/administradores",
        update: "/administradores/2",
        remove: "/administradores/2",
      });

    const result = await controller.find(
      {
        nome: "Adm",
        cnpj: "123",
      },
      requestMock as never,
    );

    expect(service.findManyPaginated).toHaveBeenCalledWith(
      {
        nome: "Adm",
        email: undefined,
        cnpj: "123",
      },
      1,
      10,
    );
    expect(result).toEqual({
      data: [
        {
          id: "1",
          nome: "Administrador Teste",
          email: "admin@quadras.com",
          cnpj: "12345678000199",
          idEndereco: "10",
          idUsuario: null,
          _links: {
            self: { href: "/administradores/1" },
            collection: { href: "/administradores" },
            update: { href: "/administradores/1" },
            remove: { href: "/administradores/1" },
          },
        },
        {
          id: "2",
          nome: "Administrador Teste",
          email: "outro@quadras.com",
          cnpj: "12345678000199",
          idEndereco: "10",
          idUsuario: null,
          _links: {
            self: { href: "/administradores/2" },
            collection: { href: "/administradores" },
            update: { href: "/administradores/2" },
            remove: { href: "/administradores/2" },
          },
        },
      ],
      page: {
        page: 1,
        perPage: 10,
        totalItems: 2,
        totalPages: 1,
      },
      _links: {
        self: {
          href: "/administradores?page=1&perPage=10&nome=Adm&cnpj=123",
        },
        first: {
          href: "/administradores?page=1&perPage=10&nome=Adm&cnpj=123",
        },
        last: {
          href: "/administradores?page=1&perPage=10&nome=Adm&cnpj=123",
        },
        next: undefined,
        prev: undefined,
      },
    });
  });

  it("deve salvar administrador", async () => {
    const service = makeService();
    const controller = new AdministradorController(
      service as unknown as AdministradorService,
    );
    const administrador = makeAdministrador({ id: 8n, idEndereco: 11n });

    service.save.mockResolvedValue(administrador);
    service.buildAdministradorLinks.mockReturnValue({
      self: "/administradores/8",
      collection: "/administradores",
      update: "/administradores/8",
      remove: "/administradores/8",
    });

    const dto = {
      nome: "Teste",
      email: "teste@quadras.com",
      cnpj: "12345678000199",
      idEndereco: "11",
    };
    const result = await controller.save(dto, requestMock as never);

    expect(service.save).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      id: "8",
      nome: "Administrador Teste",
      email: "admin@quadras.com",
      cnpj: "12345678000199",
      idEndereco: "11",
      idUsuario: null,
      _links: {
        self: { href: "/administradores/8" },
        collection: { href: "/administradores" },
        update: { href: "/administradores/8" },
        remove: { href: "/administradores/8" },
      },
    });
  });

  it("deve atualizar administrador", async () => {
    const service = makeService();
    const controller = new AdministradorController(
      service as unknown as AdministradorService,
    );

    service.updateById.mockResolvedValue(makeAdministrador({ id: 5n }));
    service.buildAdministradorLinks.mockReturnValue({
      self: "/administradores/5",
      collection: "/administradores",
      update: "/administradores/5",
      remove: "/administradores/5",
    });

    const body = { nome: "Novo Nome" };
    const result = await controller.update("5", body, requestMock as never);

    expect(service.updateById).toHaveBeenCalledWith("5", body);
    expect(result).toEqual({
      id: "5",
      nome: "Administrador Teste",
      email: "admin@quadras.com",
      cnpj: "12345678000199",
      idEndereco: "10",
      idUsuario: null,
      _links: {
        self: { href: "/administradores/5" },
        collection: { href: "/administradores" },
        update: { href: "/administradores/5" },
        remove: { href: "/administradores/5" },
      },
    });
  });

  it("deve remover administrador", async () => {
    const service = makeService();
    const controller = new AdministradorController(
      service as unknown as AdministradorService,
    );

    service.removeById.mockResolvedValue(undefined);

    await controller.remove("9");

    expect(service.removeById).toHaveBeenCalledWith("9");
  });
});
