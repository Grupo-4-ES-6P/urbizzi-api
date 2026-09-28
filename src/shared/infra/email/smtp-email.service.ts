import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import type {
  EmailService,
  SendEmailInput,
} from "../../application/email/email.service";

@Injectable()
export class SmtpEmailService implements EmailService {
  constructor(private readonly configService: ConfigService) {}

  async send(input: SendEmailInput): Promise<void> {
    const host = this.configService.get<string>("SMTP_HOST");
    const user = this.configService.get<string>("SMTP_USER");
    const pass = this.configService.get<string>("SMTP_PASS");
    const from = this.configService.get<string>("SMTP_FROM");

    if (!host || !user || !pass || !from) {
      throw new ServiceUnavailableException(
        "Serviço de email não configurado.",
      );
    }

    const port = Number(this.configService.get<string>("SMTP_PORT") ?? "587");
    const secure =
      this.configService.get<string>("SMTP_SECURE")?.toLowerCase() === "true";
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    await transporter.sendMail({ from, ...input });
  }
}
