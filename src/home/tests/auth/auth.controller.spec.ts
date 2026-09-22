import { AuthService } from "@modules/auth/application/services/auth.service";
import { AuthController } from "@modules/auth/infra/controllers/auth.controller";
import type { Mock } from "jest-mock";

type AuthServiceMock = {
  login: Mock;
};

const makeService = (): AuthServiceMock => ({
  login: jest.fn(),
});

describe("AuthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve delegar login para o service", async () => {
    const service = makeService();
    const controller = new AuthController(service as unknown as AuthService);

    service.login.mockResolvedValue({
      accessToken: "token-123",
      tokenType: "Bearer",
      expiresIn: "1h",
      usuario: {
        id: "1",
        email: "admin@quadras.com",
        idJogador: null,
        idAdministrador: "7",
        permissoes: ["ADMIN"],
      },
    });

    const body = {
      email: "admin@quadras.com",
      senha: "123456",
    };

    const result = await controller.login(body);

    expect(service.login).toHaveBeenCalledWith(body);
    expect(result).toEqual({
      accessToken: "token-123",
      tokenType: "Bearer",
      expiresIn: "1h",
      usuario: {
        id: "1",
        email: "admin@quadras.com",
        idJogador: null,
        idAdministrador: "7",
        permissoes: ["ADMIN"],
      },
    });
  });
});
