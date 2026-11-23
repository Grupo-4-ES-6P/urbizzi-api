import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { SharedModule } from "@shared/shared.module";
import { PermissaoService } from "./application/services/permissao.service";
import { PERFIL_PERMISSAO_REPOSITORY } from "./domain/repositories/perfil-permissao.repository";
import { PermissaoController } from "./infra/controllers/permissao.controller";
import { DrizzlePerfilPermissaoRepository } from "./infra/repositories/drizzle-perfil-permissao.repository";

@Module({
  imports: [SharedModule, JwtModule.register({})],
  controllers: [PermissaoController],
  providers: [
    PermissaoService,
    JwtAuthGuard,
    PermissoesGuard,
    {
      provide: PERFIL_PERMISSAO_REPOSITORY,
      useClass: DrizzlePerfilPermissaoRepository,
    },
  ],
  exports: [PermissaoService],
})
export class PermissoesModule {}
