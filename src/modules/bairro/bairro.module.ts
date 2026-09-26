import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";
import { BairroService } from "./application/services/bairro.service";
import { BAIRRO_REPOSITORY } from "./domain/repositories/bairro.repository";
import { BairroController } from "./infra/controllers/bairro.controller";
import { DrizzleBairroRepository } from "./infra/repositories/drizzle-bairro.repository";

@Module({
  imports: [SharedModule],
  controllers: [BairroController],
  providers: [
    BairroService,
    DrizzleBairroRepository,
    {
      provide: BAIRRO_REPOSITORY,
      useExisting: DrizzleBairroRepository,
    },
  ],
  exports: [BairroService, BAIRRO_REPOSITORY],
})
export class BairroModule {}
