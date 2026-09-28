import { Module } from "@nestjs/common";
import { EMAIL_SERVICE } from "./application/email/email.service";
import { SmtpEmailService } from "./infra/email/smtp-email.service";

@Module({
  providers: [
    SmtpEmailService,
    { provide: EMAIL_SERVICE, useExisting: SmtpEmailService },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
