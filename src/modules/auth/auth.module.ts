import { Module } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import type { StringValue } from "ms";
import { AuthService } from "./application/services/auth.service";
import { AUTH_USUARIO_REPOSITORY } from "./domain/repositories/auth-usuario.repository";
import { AuthController } from "./infra/controllers/auth.controller";
import { DrizzleAuthUsuarioRepository } from "./infra/repositories/drizzle-auth-usuario.repository";

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
  controllers: [AuthController],
  providers: [
    AuthService,
    DrizzleService,
    {
      provide: AUTH_USUARIO_REPOSITORY,
      useClass: DrizzleAuthUsuarioRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
