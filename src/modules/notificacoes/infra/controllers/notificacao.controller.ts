import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { JwtAuthGuard, type RequestAuthUser } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { ConfigNotificacaoService, SalvarConfigDto } from "../../application/config-notificacao.service";
import { NotificacaoService } from "../../application/notificacao.service";

type RequisicaoAutenticada = { user: RequestAuthUser };

/** Cada usuário só enxerga e marca as próprias notificações. */
@ApiTags("notificacoes")
@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("notificacoes")
export class NotificacaoController {
  constructor(
    private readonly service: NotificacaoService,
    private readonly config: ConfigNotificacaoService,
  ) {}

  @Get("config")
  listarConfig() {
    return this.config.listar();
  }

  @Permissoes("GERENCIAR_USUARIOS")
  @Put("config/:tipo")
  salvarConfig(@Param("tipo") tipo: string, @Body() body: SalvarConfigDto) {
    return this.config.salvar(tipo, body);
  }

  @Permissoes("GERENCIAR_USUARIOS")
  @Get("envios")
  envios() {
    return this.service.envios();
  }

  @Get()
  listar(@Req() req: RequisicaoAutenticada) {
    return this.service.listar(req.user.sub);
  }

  @HttpCode(204)
  @Post("lidas")
  async marcarTodas(@Req() req: RequisicaoAutenticada): Promise<void> {
    await this.service.marcarTodas(req.user.sub);
  }

  @HttpCode(204)
  @Patch(":id/lida")
  async marcarLida(@Param("id") id: string, @Req() req: RequisicaoAutenticada): Promise<void> {
    await this.service.marcarLida(req.user.sub, id);
  }
}
