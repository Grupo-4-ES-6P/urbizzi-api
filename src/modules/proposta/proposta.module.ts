import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { SharedModule } from "@shared/shared.module";
import { PropostaService } from "./application/services/proposta.service";
import { PROPOSTA_REPOSITORY } from "./domain/repositories/proposta.repository";
import { PropostaController } from "./infra/controllers/proposta.controller";
import { DrizzlePropostaRepository } from "./infra/repositories/drizzle-proposta.repository";

@Module({
  imports: [SharedModule, JwtModule.register({})],
  controllers: [PropostaController],
  providers: [
    PropostaService,
    JwtAuthGuard,
    DrizzlePropostaRepository,
    { provide: PROPOSTA_REPOSITORY, useExisting: DrizzlePropostaRepository },
  ],
})
export class PropostaModule {}
