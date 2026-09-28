import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ClienteAccessService } from "@modules/clientes/application/services/cliente-access.service";
import type { ClienteAccessRepository } from "@modules/clientes/domain/repositories/cliente-access.repository";
import type { ConfigService } from "@nestjs/config";
import type { EmailService } from "@shared/application/email/email.service";
import type { Mocked } from "jest-mock";

const makeRepository = (): Mocked<ClienteAccessRepository> => ({
  emailExists: jest.fn(),
  createForClient: jest.fn(),
  renewInvitation: jest.fn(),
  activate: jest.fn(),
  changeStatus: jest.fn(),
  deactivateClient: jest.fn(),
});

const makeEmailService = (): Mocked<EmailService> => ({ send: jest.fn() });

describe("ClienteAccessService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("gera token opaco e persiste somente seu hash", async () => {
    const repository = makeRepository();
    const email = makeEmailService();
    const config = { get: jest.fn().mockReturnValue("https://app/ativar") };
    const service = new ClienteAccessService(
      repository,
      email,
      config as unknown as ConfigService,
    );
    repository.emailExists.mockResolvedValue(false);

    const pending = await service.preparePendingAccess(" CLIENTE@EXAMPLE.COM ");

    expect(pending.email).toBe("cliente@example.com");
    expect(pending.rawToken).toHaveLength(64);
    expect(pending.tokenHash).toHaveLength(64);
    expect(pending.tokenHash).not.toBe(pending.rawToken);
    expect(pending.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("ativa acesso usando hash do token e hash da senha", async () => {
    const repository = makeRepository();
    const service = new ClienteAccessService(repository, makeEmailService(), {
      get: jest.fn(),
    } as unknown as ConfigService);

    await service.activate("a".repeat(64), "senha-segura");

    expect(repository.activate).toHaveBeenCalledWith({
      tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      passwordHash: expect.not.stringMatching("senha-segura"),
    });
  });

  it("mantém fluxo recuperável quando SMTP falha", async () => {
    const email = makeEmailService();
    const service = new ClienteAccessService(makeRepository(), email, {
      get: jest.fn().mockReturnValue("https://app/ativar"),
    } as unknown as ConfigService);
    email.send.mockRejectedValue(new Error("smtp indisponível"));

    await expect(
      service.sendInvitation("cliente@example.com", "token"),
    ).resolves.toBe(false);
  });
});
