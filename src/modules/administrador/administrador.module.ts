import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import type { StringValue } from "ms";
import { AdministradorService } from "./application/services/administrador.service";
import { ADMINISTRADOR_REPOSITORY } from "./domain/repositories/administrador.repository";
import { AdministradorController } from "./infra/controllers/administrador.controller";
import { DrizzleAdministradorRepository } from "./infra/repositories/drizzle-administrador.repository";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = (configService.get<string>("JWT_EXPIRES_IN") ??
          "1h") as StringValue;

        return {
          secret:
            configService.get<string>("JWT_SECRET") ??
            "backend-quadras-dev-secret",
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AdministradorController],
  providers: [
    AdministradorService,
    DrizzleService,
    JwtAuthGuard,
    PermissoesGuard,
    {
      provide: ADMINISTRADOR_REPOSITORY,
      useClass: DrizzleAdministradorRepository,
    },
  ],
  exports: [AdministradorService, ADMINISTRADOR_REPOSITORY],
})
export class AdministradorModule {}
