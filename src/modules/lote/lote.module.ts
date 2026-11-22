import { LoteService } from "@modules/lote/application/service/lote.service";
import { LoteController } from "@modules/lote/infra/controller/lote.controller";
import { LOTE_REPOSITORY } from "@modules/lote/domain/repository/lote.repository.interface";
import { DrizzleLoteRepository } from "@modules/lote/infra/repository/lote.drizzle.repository";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { SharedModule } from "@shared/shared.module";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";

@Module({
  imports: [
    SharedModule,
    JwtModule.register({}),
  ],
  controllers: [
    LoteController
  ],
  providers: [
    JwtAuthGuard,
    PermissoesGuard,
    LoteService,
    DrizzleLoteRepository,
    {
      provide: LOTE_REPOSITORY,
      useExisting: DrizzleLoteRepository
    }
  ],
  exports: [
    LoteService,
    LOTE_REPOSITORY
  ],
})
export class LoteModule {}
