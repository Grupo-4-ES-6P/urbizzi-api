import { Module } from "@nestjs/common";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { SharedModule } from "@shared/shared.module";
import { ClienteService } from "./application/services/cliente.service";
import { CLIENTE_REPOSITORY } from "./domain/repositories/cliente.repository";
import { ClienteController } from "./infra/controllers/cliente.controller";
import { DrizzleClienteRepository } from "./infra/repositories/drizzle-cliente.repository";

@Module({
  imports: [SharedModule],
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
