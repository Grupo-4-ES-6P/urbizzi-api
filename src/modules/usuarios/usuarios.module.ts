import { UsuarioService } from "@modules/usuarios/application/services/usuario.service";
import { USUARIO_REPOSITORY } from "@modules/usuarios/domain/repositories/usuario-repository.interface";
import { DrizzleUsuarioRepository } from "@modules/usuarios/infra/repositories/drizzle-usuario.repository";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { SharedModule } from "@shared/shared.module";
import type { StringValue } from "ms";
import { UsuarioController } from "./infra/controllers/usuario.controller";

@Module({
  imports: [
    SharedModule,
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
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    JwtAuthGuard,
    DrizzleUsuarioRepository,
    {
      provide: USUARIO_REPOSITORY,
      useExisting: DrizzleUsuarioRepository,
    },
  ],
  exports: [UsuarioService],
})
export class UsuariosModule {}
