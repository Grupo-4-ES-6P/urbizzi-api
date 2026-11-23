import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { JwtAuthGuard, type RequestAuthUser } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { CriarLinkDto, LinkPublicoService } from "../../application/link-publico.service";

@ApiTags("links-publicos")
@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("links-publicos")
export class LinkPublicoController {
  constructor(private readonly service: LinkPublicoService) {}

  @Permissoes("PUBLICAR_CATALOGO")
  @Post()
  criar(@Body() body: CriarLinkDto, @Req() req: { user: RequestAuthUser }) {
    return this.service.criar(body, req.user.sub);
  }

  @Get()
  listar() {
    return this.service.listar();
  }
}

@ApiTags("publico")
@Controller("publico/links")
export class LinkPublicoAbertoController {
  constructor(private readonly service: LinkPublicoService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get(":token")
  abrir(@Param("token") token: string) {
    return this.service.abrir(token);
  }
}
