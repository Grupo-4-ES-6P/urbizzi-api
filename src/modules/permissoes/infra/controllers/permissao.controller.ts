import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { AlterarPermissaoDto } from "../../application/dto/alterar-permissao.dto";
import {
  type MatrizResponse,
  PermissaoService,
} from "../../application/services/permissao.service";

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("permissoes")
export class PermissaoController {
  constructor(private readonly service: PermissaoService) {}

  @Permissoes(Permission.USER_READ)
  @Get()
  async obter(): Promise<MatrizResponse> {
    return this.service.obterMatriz();
  }

  @Permissoes(Permission.USER_UPDATE)
  @Put()
  async alterar(@Body() body: AlterarPermissaoDto): Promise<MatrizResponse> {
    return this.service.alterar(body);
  }
}
