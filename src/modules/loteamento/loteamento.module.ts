import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { SharedModule } from "@shared/shared.module";
import { LoteamentoService } from "./application/services/loteamento.service";
import { LOTEAMENTO_REPOSITORY } from "./domain/repositories/loteamento.repository";
import { LoteamentoController } from "./infra/controllers/loteamento.controller";
import { DrizzleLoteamentoRepository } from "./infra/repositories/drizzle-loteamento.repository";

@Module({
  imports: [SharedModule, JwtModule.register({})],
  controllers: [LoteamentoController],
  providers: [
    LoteamentoService,
    JwtAuthGuard,
    PermissoesGuard,
    DrizzleLoteamentoRepository,
    {
      provide: LOTEAMENTO_REPOSITORY,
      useExisting: DrizzleLoteamentoRepository,
    },
  ],
})
export class LoteamentoModule {}
