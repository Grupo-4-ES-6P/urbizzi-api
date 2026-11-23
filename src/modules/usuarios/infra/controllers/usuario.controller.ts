import { CreateUsuarioDto } from "@modules/usuarios/application/dto/usuario-create.dto";
import { UpdateUsuarioDto } from "@modules/usuarios/application/dto/usuario-update.dto";
import type { UsuarioResponseDto } from "@modules/usuarios/application/dto/usuario-response.dto";
import { UsuarioService } from "@modules/usuarios/application/services/usuario.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("users")
export class UsuarioController {
  constructor(private readonly userService: UsuarioService) {}

  @Permissoes(Permission.USER_READ)
  @Get()
  async findAll(): Promise<UsuarioResponseDto[]> {
    return this.userService.findAll();
  }

  /** Nomes e perfis da equipe, para qualquer usuário logado (corretor responsável etc.). */
  @Get("equipe")
  async equipe(): Promise<{ id: string; nome: string; perfil: string; ativo: boolean }[]> {
    const usuarios = await this.userService.findAll();
    return usuarios.map((u) => ({ id: u.id, nome: u.name, perfil: u.perfil, ativo: u.status === "ATIVO" }));
  }

  @Permissoes(Permission.USER_READ)
  @Get(":id")
  async findById(@Param("id") id: string): Promise<UsuarioResponseDto> {
    return this.userService.findById(id);
  }

  @Permissoes(Permission.USER_WRITE)
  @Post()
  async create(@Body() body: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    return this.userService.create(body);
  }

  @Permissoes(Permission.USER_UPDATE)
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    return this.userService.update(id, body);
  }

  @Permissoes(Permission.USER_DELETE)
  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
