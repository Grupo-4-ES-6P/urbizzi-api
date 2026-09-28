import { createHash, randomBytes } from "node:crypto";
import { ConflictException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  EMAIL_SERVICE,
  type EmailService,
} from "@shared/application/email/email.service";
import { hash } from "bcryptjs";
import {
  CLIENTE_ACCESS_REPOSITORY,
  type ClienteAccessRepository,
} from "../../domain/repositories/cliente-access.repository";

export interface PendingClienteAccess {
  email: string;
  passwordHash: string;
  tokenHash: string;
  expiresAt: Date;
  rawToken: string;
}

@Injectable()
export class ClienteAccessService {
  private readonly logger = new Logger(ClienteAccessService.name);

  constructor(
    @Inject(CLIENTE_ACCESS_REPOSITORY)
    private readonly accessRepository: ClienteAccessRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async preparePendingAccess(email: string): Promise<PendingClienteAccess> {
    const normalizedEmail = email.trim().toLowerCase();
    if (await this.accessRepository.emailExists(normalizedEmail)) {
      throw new ConflictException("Email de acesso já cadastrado.");
    }
    const rawToken = randomBytes(32).toString("hex");
    return {
      email: normalizedEmail,
      passwordHash: await hash(randomBytes(32).toString("hex"), 10),
      tokenHash: this.hashToken(rawToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      rawToken,
    };
  }

  async createForClient(clienteId: bigint, email: string): Promise<boolean> {
    const pending = await this.preparePendingAccess(email);
    await this.accessRepository.createForClient({ clienteId, ...pending });
    return this.sendInvitation(pending.email, pending.rawToken);
  }

  async resend(clienteId: bigint): Promise<boolean> {
    const rawToken = randomBytes(32).toString("hex");
    const email = await this.accessRepository.renewInvitation({
      clienteId,
      tokenHash: this.hashToken(rawToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return this.sendInvitation(email, rawToken);
  }

  async activate(token: string, senha: string): Promise<void> {
    await this.accessRepository.activate({
      tokenHash: this.hashToken(token),
      passwordHash: await hash(senha, 10),
    });
  }

  async block(clienteId: bigint): Promise<void> {
    await this.accessRepository.changeStatus(clienteId, "INATIVO");
  }

  async reactivate(clienteId: bigint): Promise<void> {
    await this.accessRepository.changeStatus(clienteId, "ATIVO");
  }

  async deactivateClient(clienteId: bigint): Promise<void> {
    await this.accessRepository.deactivateClient(clienteId);
  }

  async sendInvitation(email: string, rawToken: string): Promise<boolean> {
    const baseUrl = this.configService.get<string>("CLIENTE_ACTIVATION_URL");
    if (!baseUrl) {
      this.logger.warn(
        "CLIENTE_ACTIVATION_URL não configurada; convite não enviado.",
      );
      return false;
    }
    const separator = baseUrl.includes("?") ? "&" : "?";
    const link = `${baseUrl}${separator}token=${encodeURIComponent(rawToken)}`;
    try {
      await this.emailService.send({
        to: email,
        subject: "Ative seu acesso à Urbizzi",
        text: `Defina sua senha usando este link, válido por 24 horas: ${link}`,
        html: `<p>Defina sua senha usando o link abaixo. Ele é válido por 24 horas e pode ser usado uma única vez.</p><p><a href="${link}">Ativar acesso</a></p>`,
      });
      return true;
    } catch (error) {
      this.logger.error("Falha ao enviar convite de acesso do cliente.", error);
      return false;
    }
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
