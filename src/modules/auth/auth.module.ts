import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { EmailService } from "@shared/infra/email/email.service";
import { PermissoesModule } from "@modules/permissoes/permissoes.module";
import type { StringValue } from "ms";
import { AuthService } from "./application/services/auth.service";
import { AUTH_USUARIO_REPOSITORY } from "./domain/repositories/auth-usuario.repository";
import { AuthController } from "./infra/controllers/auth.controller";
import { DrizzleAuthUsuarioRepository } from "./infra/repositories/drizzle-auth-usuario.repository";

@Module({
  imports: [
    PermissoesModule,
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
    EmailService,
    JwtAuthGuard,
    {
      provide: AUTH_USUARIO_REPOSITORY,
      useClass: DrizzleAuthUsuarioRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
