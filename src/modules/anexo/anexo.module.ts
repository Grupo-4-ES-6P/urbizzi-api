import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { SharedModule } from "@shared/shared.module";
import { AnexoService } from "./application/services/anexo.service";
import { ANEXO_REPOSITORY } from "./domain/repositories/anexo.repository";
import { AnexoController } from "./infra/controllers/anexo.controller";
import { DrizzleAnexoRepository } from "./infra/repositories/drizzle-anexo.repository";

@Module({
  imports: [SharedModule, JwtModule.register({})],
  controllers: [AnexoController],
  providers: [
    AnexoService,
    JwtAuthGuard,
    PermissoesGuard,
    DrizzleAnexoRepository,
    { provide: ANEXO_REPOSITORY, useExisting: DrizzleAnexoRepository },
  ],
  exports: [AnexoService, ANEXO_REPOSITORY],
})
export class AnexoModule {}
