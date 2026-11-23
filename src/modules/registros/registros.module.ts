import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { SharedModule } from "@shared/shared.module";
import { RegistroService } from "./application/registro.service";
import { PublicoController } from "./infra/controllers/publico.controller";
import { criarRegistroController } from "./infra/controllers/registro.controller";
import { REGISTROS } from "./registros.config";

@Module({
  imports: [SharedModule, JwtModule.register({})],
  controllers: [...REGISTROS.map(criarRegistroController), PublicoController],
  providers: [
    JwtAuthGuard,
    PermissoesGuard,
    ...REGISTROS.map((def) => ({
      provide: def.token,
      inject: [DrizzleService],
      useFactory: (drizzle: DrizzleService) => new RegistroService(drizzle, def),
    })),
  ],
})
export class RegistrosModule {}
