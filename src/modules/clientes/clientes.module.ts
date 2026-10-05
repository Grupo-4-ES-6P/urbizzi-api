import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { SharedModule } from "@shared/shared.module";
import type { StringValue } from "ms";
import { ClienteService } from "./application/services/cliente.service";
import { CLIENTE_REPOSITORY } from "./domain/repositories/cliente.repository";
import { ClienteController } from "./infra/controllers/cliente.controller";
import { DrizzleClienteRepository } from "./infra/repositories/drizzle-cliente.repository";

@Module({
  imports: [
    SharedModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>("JWT_SECRET") ??
          "backend-quadras-dev-secret",
        signOptions: {
          expiresIn: (configService.get<string>("JWT_EXPIRES_IN") ??
            "1h") as StringValue,
        },
      }),
    }),
  ],
  controllers: [ClienteController],
  providers: [
    ClienteService,
    JwtAuthGuard,
    PermissoesGuard,
    {
      provide: CLIENTE_REPOSITORY,
      useClass: DrizzleClienteRepository,
    },
  ],
  exports: [ClienteService, CLIENTE_REPOSITORY],
})
export class ClientesModule {}
