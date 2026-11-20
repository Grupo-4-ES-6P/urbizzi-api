import { QuadraService } from "@modules/quadra/application/services/quadra.service";
import { QuadraController } from "@modules/quadra/infra/controllers/quadra.controller";
import { QUADRA_REPOSITORY } from "@modules/quadra/domain/repositories/quadra.repository.interface";
import { DrizzleQuadraRepository } from "./infra/repositories/quadra.repository";
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
    QuadraController,
  ],
  providers: [
    JwtAuthGuard,
    PermissoesGuard,
    QuadraService,
    DrizzleQuadraRepository,
    {
      provide: QUADRA_REPOSITORY,
      useExisting: DrizzleQuadraRepository,
    }
  ],
  exports: [
    QuadraService,
    QUADRA_REPOSITORY,
  ],
})
export class QuadraModule {}
