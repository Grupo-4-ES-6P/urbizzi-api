import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";
import { LogradouroService } from "./application/services/logradouro.service";
import { LOGRADOURO_REPOSITORY } from "./domain/repositories/logradouro.repository";
import { LogradouroController } from "./infra/controllers/logradouro.controller";
import { DrizzleLogradouroRepository } from "./infra/repositories/drizzle-logradouro.repository";

@Module({
  imports: [SharedModule],
  controllers: [LogradouroController],
  providers: [
    LogradouroService,
    DrizzleLogradouroRepository,
    {
      provide: LOGRADOURO_REPOSITORY,
      useExisting: DrizzleLogradouroRepository,
    },
  ],
  exports: [LogradouroService, LOGRADOURO_REPOSITORY],
})
export class LogradouroModule {}
