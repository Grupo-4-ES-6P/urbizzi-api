import { PermissoesModule } from "@modules/permissoes/permissoes.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { EmailService } from "@shared/infra/email/email.service";
import { SharedModule } from "@shared/shared.module";
import { ConfigNotificacaoService } from "./application/config-notificacao.service";
import { NotificacaoService } from "./application/notificacao.service";
import { NotificacaoController } from "./infra/controllers/notificacao.controller";

@Module({
  imports: [SharedModule, PermissoesModule, JwtModule.register({})],
  controllers: [NotificacaoController],
  providers: [NotificacaoService, ConfigNotificacaoService, EmailService, JwtAuthGuard, PermissoesGuard],
  exports: [NotificacaoService, ConfigNotificacaoService],
})
export class NotificacoesModule {}
