import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";
import { CidadeService } from "./application/services/cidade.service";
import { CIDADE_REPOSITORY } from "./domain/repositories/cidade.repository";
import { CidadeController } from "./infra/controllers/cidade.controller";
import { DrizzleCidadeRepository } from "./infra/repositories/drizzle-cidade.repository";

@Module({
  imports: [SharedModule],
  controllers: [CidadeController],
  providers: [
    CidadeService,
    DrizzleCidadeRepository,
    {
      provide: CIDADE_REPOSITORY,
      useExisting: DrizzleCidadeRepository,
    },
  ],
  exports: [CidadeService, CIDADE_REPOSITORY],
})
export class CidadeModule {}
