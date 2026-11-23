import { AuthService } from "@modules/auth/application/services/auth.service";
import { UsuarioAuthEntity } from "@modules/auth/domain/models/usuario-auth.entity";
import type { AuthUsuarioRepository } from "@modules/auth/domain/repositories/auth-usuario.repository";
import type { PermissaoService } from "@modules/permissoes/application/services/permissao.service";
import { Perfil } from "@modules/permissoes/domain/permissoes.catalogo";
import { UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import type { EmailService } from "@shared/infra/email/email.service";
import { compare } from "bcryptjs";
import type { Mock, Mocked, MockedFunction } from "jest-mock";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

type AuthUsuarioRepositoryMock = Mocked<AuthUsuarioRepository>;
type JwtServiceMock = { signAsync: Mock };
type ConfigServiceMock = { get: Mock };
type PermissaoServiceMock = { permissoesDoUsuario: Mock };

const makeRepository = (): AuthUsuarioRepositoryMock => ({
  findByEmail: jest.fn(),
  registrarAcesso: jest.fn(),
  findById: jest.fn(),
  atualizarSenha: jest.fn(),
});

const makeJwtService = (): JwtServiceMock => ({
  signAsync: jest.fn(),
});

const makeConfigService = (): ConfigServiceMock => ({
  get: jest.fn(),
});

const makePermissaoService = (): PermissaoServiceMock => ({
  permissoesDoUsuario: jest.fn().mockResolvedValue([]),
});

const makeUsuario = (overrides?: Partial<UsuarioAuthEntity>) =>
  Object.assign(
    new UsuarioAuthEntity({
      id: 1n,
      name: "Ana Admin",
      email: "admin@urbizzi.com",
      senhaHash: "senha-hash",
      anexoId: null,
      permissoes: [],
      status: "ATIVO",
      perfil: Perfil.ADMINISTRADOR,
    }),
    overrides,
  );

const makeService = () => {
  const repository = makeRepository();
  const jwtService = makeJwtService();
  const configService = makeConfigService();
  const permissaoService = makePermissaoService();
  const emailService = { enviar: jest.fn() };
  const service = new AuthService(
    repository,
    jwtService as unknown as JwtService,
    configService as unknown as ConfigService,
    permissaoService as unknown as PermissaoService,
    emailService as unknown as EmailService,
  );
  return { service, repository, jwtService, configService, permissaoService, emailService };
};

describe("AuthService", () => {
  const compareMock = compare as MockedFunction<typeof compare>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve lançar unauthorized quando usuário não existir", async () => {
    const { service, repository, jwtService } = makeService();
    repository.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: "naoexiste@urbizzi.com", senha: "123456" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(compareMock).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it("deve lançar unauthorized quando senha for inválida", async () => {
    const { service, repository, jwtService } = makeService();
    repository.findByEmail.mockResolvedValue(makeUsuario());
    compareMock.mockResolvedValue(false as never);

    await expect(
      service.login({ email: "admin@urbizzi.com", senha: "senha-errada" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(repository.registrarAcesso).not.toHaveBeenCalled();
  });

  it("deve montar as permissões pelo perfil e registrar o acesso", async () => {
    const { service, repository, jwtService, configService, permissaoService } =
      makeService();
    const usuario = makeUsuario({
      id: 10n,
      perfil: Perfil.CORRETOR,
      permissoes: [" EXTRA ", ""],
    });

    repository.findByEmail.mockResolvedValue(usuario);
    compareMock.mockResolvedValue(true as never);
    permissaoService.permissoesDoUsuario.mockResolvedValue([
      "CLIENTE_VISUALIZAR",
      "CRIAR_PROPOSTA",
      "EXTRA",
    ]);
    jwtService.signAsync.mockResolvedValue("token-123");
    configService.get.mockReturnValue("2h");

    const result = await service.login({
      email: "  ADMIN@URBIZZI.COM ",
      senha: "senha-correta",
    });

    expect(repository.findByEmail).toHaveBeenCalledWith("admin@urbizzi.com");
    expect(permissaoService.permissoesDoUsuario).toHaveBeenCalledWith(
      Perfil.CORRETOR,
      ["EXTRA"],
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: "10",
      email: "admin@urbizzi.com",
      permissoes: ["CLIENTE_VISUALIZAR", "CRIAR_PROPOSTA", "EXTRA"],
    });
    expect(repository.registrarAcesso).toHaveBeenCalledWith(10n);
    expect(result).toEqual({
      accessToken: "token-123",
      tokenType: "Bearer",
      expiresIn: "2h",
      usuario: {
        id: "10",
        nome: "Ana Admin",
        email: "admin@urbizzi.com",
        perfil: Perfil.CORRETOR,
        permissoes: ["CLIENTE_VISUALIZAR", "CRIAR_PROPOSTA", "EXTRA"],
        trocarSenha: false,
      },
    });
  });

  it("deve usar expiração padrão quando JWT_EXPIRES_IN não estiver definida", async () => {
    const { service, repository, jwtService, configService } = makeService();
    repository.findByEmail.mockResolvedValue(makeUsuario({ permissoes: null }));
    compareMock.mockResolvedValue(true as never);
    jwtService.signAsync.mockResolvedValue("token-456");
    configService.get.mockReturnValue(undefined);

    const result = await service.login({
      email: "admin@urbizzi.com",
      senha: "senha-correta",
    });

    expect(result.expiresIn).toBe("1h");
  });

  it("deve rejeitar login de usuário inativo", async () => {
    const { service, repository } = makeService();
    repository.findByEmail.mockResolvedValue(
      makeUsuario({ status: "INATIVO" }),
    );

    await expect(
      service.login({ email: "admin@urbizzi.com", senha: "qualquer" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(compareMock).not.toHaveBeenCalled();
  });
});
