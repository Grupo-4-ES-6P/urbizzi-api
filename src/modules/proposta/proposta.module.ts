import { NotificacoesModule } from "@modules/notificacoes/notificacoes.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { SharedModule } from "@shared/shared.module";
import { PropostaPrazoService } from "./application/services/proposta-prazo.service";
import { PropostaService } from "./application/services/proposta.service";
import { PROPOSTA_REPOSITORY } from "./domain/repositories/proposta.repository";
import { PropostaController } from "./infra/controllers/proposta.controller";
import { DrizzlePropostaRepository } from "./infra/repositories/drizzle-proposta.repository";

@Module({
  imports: [SharedModule, NotificacoesModule, JwtModule.register({})],
  controllers: [PropostaController],
  providers: [
    PropostaService,
    PropostaPrazoService,
    JwtAuthGuard,
    PermissoesGuard,
    DrizzlePropostaRepository,
    { provide: PROPOSTA_REPOSITORY, useExisting: DrizzlePropostaRepository },
  ],
})
export class PropostaModule {}
