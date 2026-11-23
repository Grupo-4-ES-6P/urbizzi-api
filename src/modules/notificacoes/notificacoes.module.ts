import { PermissoesModule } from "@modules/permissoes/permissoes.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { SharedModule } from "@shared/shared.module";
import { NotificacaoService } from "./application/notificacao.service";
import { NotificacaoController } from "./infra/controllers/notificacao.controller";

@Module({
  imports: [SharedModule, PermissoesModule, JwtModule.register({})],
  controllers: [NotificacaoController],
  providers: [NotificacaoService, JwtAuthGuard],
  exports: [NotificacaoService],
})
export class NotificacoesModule {}
