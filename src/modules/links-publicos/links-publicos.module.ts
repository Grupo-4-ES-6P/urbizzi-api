import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { SharedModule } from "@shared/shared.module";
import { LinkPublicoService } from "./application/link-publico.service";
import { LinkPublicoAbertoController, LinkPublicoController } from "./infra/controllers/link-publico.controller";

@Module({
  imports: [SharedModule, JwtModule.register({})],
  controllers: [LinkPublicoController, LinkPublicoAbertoController],
  providers: [LinkPublicoService, JwtAuthGuard, PermissoesGuard],
})
export class LinksPublicosModule {}
