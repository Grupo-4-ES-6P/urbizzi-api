import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { SharedModule } from "@shared/shared.module";
import type { StringValue } from "ms";

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
            ":3",
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [],
  providers: [
    JwtAuthGuard,
  ],
  exports: [],
})
export class QuadraModule {}
