import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  type Type,
  UseGuards,
} from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { JwtAuthGuard, type RequestAuthUser } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { RegistroDto } from "../../application/dto/registro.dto";
import type { RegistroResponse, RegistroService } from "../../application/registro.service";
import type { DefinicaoRegistro } from "../../registros.config";

type RequisicaoAutenticada = { user?: RequestAuthUser };

/** Gera o controller CRUD de um registro com a rota e a permissão dele. */
export function criarRegistroController(def: DefinicaoRegistro): Type<unknown> {
  const escrita = def.escrita ? [def.escrita] : [];

  @ApiTags(def.rota)
  @UseGuards(JwtAuthGuard, PermissoesGuard)
  @Controller(def.rota)
  class RegistroController {
    constructor(@Inject(def.token) readonly service: RegistroService) {}

    @ApiQuery({ name: "idLote", required: false })
    @ApiQuery({ name: "idCliente", required: false })
    @Get()
    listar(@Query("idLote") idLote?: string, @Query("idCliente") idCliente?: string): Promise<RegistroResponse[]> {
      return this.service.listar({ idLote, idCliente });
    }

    @Get(":id")
    buscar(@Param("id") id: string): Promise<RegistroResponse> {
      return this.service.buscar(id);
    }

    @Permissoes(...escrita)
    @Post()
    criar(@Body() body: RegistroDto, @Req() req: RequisicaoAutenticada): Promise<RegistroResponse> {
      return this.service.criar(body, req.user);
    }

    @Permissoes(...escrita)
    @Put(":id")
    atualizar(
      @Param("id") id: string,
      @Body() body: RegistroDto,
      @Req() req: RequisicaoAutenticada,
    ): Promise<RegistroResponse> {
      return this.service.atualizar(id, body, req.user);
    }

    @Permissoes(...escrita)
    @HttpCode(204)
    @Delete(":id")
    async excluir(@Param("id") id: string): Promise<void> {
      await this.service.excluir(id);
    }
  }

  Object.defineProperty(RegistroController, "name", { value: `${def.nome}Controller` });
  return RegistroController;
}
