import { AuthService } from "@modules/auth/application/services/auth.service";
import { UsuarioAuthEntity } from "@modules/auth/domain/models/usuario-auth.entity";
import type { AuthUsuarioRepository } from "@modules/auth/domain/repositories/auth-usuario.repository";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import type { Mock, Mocked, MockedFunction } from "jest-mock";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

type AuthUsuarioRepositoryMock = Mocked<AuthUsuarioRepository>;
type JwtServiceMock = {
  signAsync: Mock;
};
type ConfigServiceMock = {
  get: Mock;
};

const makeRepository = (): AuthUsuarioRepositoryMock => ({
  findByEmail: jest.fn(),
});

const makeJwtService = (): JwtServiceMock => ({
  signAsync: jest.fn(),
});

const makeConfigService = (): ConfigServiceMock => ({
  get: jest.fn(),
});

const makeUsuario = (overrides?: Partial<UsuarioAuthEntity>) =>
  new UsuarioAuthEntity({
    id: 1n,
    email: "admin@quadras.com",
    senhaHash: "senha-hash",
    idJogador: null,
    idAdministrador: 7n,
    permissoes: "ADMIN, FINANCEIRO",
    ...overrides,
  });

describe("AuthService", () => {
  const compareMock = compare as MockedFunction<typeof compare>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve lançar unauthorized quando usuário não existir", async () => {
    const repository = makeRepository();
    const jwtService = makeJwtService();
    const configService = makeConfigService();
    const service = new AuthService(
      repository,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );

    repository.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: "naoexiste@quadras.com",
        senha: "123456",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(compareMock).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it("deve lançar unauthorized quando senha for inválida", async () => {
    const repository = makeRepository();
    const jwtService = makeJwtService();
    const configService = makeConfigService();
    const service = new AuthService(
      repository,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );

    repository.findByEmail.mockResolvedValue(makeUsuario());
    compareMock.mockResolvedValue(false);

    await expect(
      service.login({
        email: "admin@quadras.com",
        senha: "senha-errada",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it("deve realizar login com sucesso e retornar token", async () => {
    const repository = makeRepository();
    const jwtService = makeJwtService();
    const configService = makeConfigService();
    const service = new AuthService(
      repository,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
    const usuario = makeUsuario({
      id: 10n,
      email: "Admin@Quadras.com",
      idJogador: 22n,
      idAdministrador: 33n,
      permissoes: "ADMIN, FINANCEIRO,  ",
    });

    repository.findByEmail.mockResolvedValue(usuario);
    compareMock.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue("token-123");
    configService.get.mockReturnValue("2h");

    const result = await service.login({
      email: "  ADMIN@QUADRAS.COM ",
      senha: "senha-correta",
    });

    expect(repository.findByEmail).toHaveBeenCalledWith("admin@quadras.com");
    expect(compareMock).toHaveBeenCalledWith("senha-correta", "senha-hash");
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: "10",
      email: "Admin@Quadras.com",
      idJogador: "22",
      idAdministrador: "33",
      permissoes: ["ADMIN", "FINANCEIRO"],
    });
    expect(result).toEqual({
      accessToken: "token-123",
      tokenType: "Bearer",
      expiresIn: "2h",
      usuario: {
        id: "10",
        email: "Admin@Quadras.com",
        idJogador: "22",
        idAdministrador: "33",
        permissoes: ["ADMIN", "FINANCEIRO"],
      },
    });
  });

  it("deve usar expiração padrão quando JWT_EXPIRES_IN não estiver definida", async () => {
    const repository = makeRepository();
    const jwtService = makeJwtService();
    const configService = makeConfigService();
    const service = new AuthService(
      repository,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );

    repository.findByEmail.mockResolvedValue(makeUsuario({ permissoes: null }));
    compareMock.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue("token-456");
    configService.get.mockReturnValue(undefined);

    const result = await service.login({
      email: "admin@quadras.com",
      senha: "senha-correta",
    });

    expect(result.expiresIn).toBe("1h");
    expect(result.usuario.permissoes).toEqual([]);
  });
});
