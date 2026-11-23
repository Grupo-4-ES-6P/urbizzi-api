import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, type Transporter } from "nodemailer";

export interface Email {
  para: string;
  assunto: string;
  texto: string;
}

/** Envia por SMTP quando configurado; sem SMTP_HOST, registra no log (desenvolvimento). */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporte?: Transporter;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>("SMTP_HOST");
    if (!host) return;
    this.transporte = createTransport({
      host,
      port: Number(config.get<string>("SMTP_PORT") ?? 587),
      secure: config.get<string>("SMTP_SECURE") === "true",
      auth: config.get<string>("SMTP_USER")
        ? { user: config.get<string>("SMTP_USER"), pass: config.get<string>("SMTP_PASS") }
        : undefined,
    });
  }

  async enviar(email: Email): Promise<void> {
    if (!this.transporte) {
      this.logger.log(`[e-mail não enviado: SMTP_HOST vazio] Para ${email.para} — ${email.assunto}\n${email.texto}`);
      return;
    }
    await this.transporte.sendMail({
      from: this.config.get<string>("SMTP_FROM") ?? this.config.get<string>("SMTP_USER"),
      to: email.para,
      subject: email.assunto,
      text: email.texto,
    });
  }
}
