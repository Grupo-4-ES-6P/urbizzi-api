import { Controller, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard, type RequestAuthUser } from "@shared/guards/jwt-auth.guard";
import { NotificacaoService } from "../../application/notificacao.service";

type RequisicaoAutenticada = { user: RequestAuthUser };

/** Cada usuário só enxerga e marca as próprias notificações. */
@ApiTags("notificacoes")
@UseGuards(JwtAuthGuard)
@Controller("notificacoes")
export class NotificacaoController {
  constructor(private readonly service: NotificacaoService) {}

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
