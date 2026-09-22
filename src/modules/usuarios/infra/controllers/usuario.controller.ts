import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  type UsuarioResponseDto,
} from "@modules/usuarios/application/dto/usuario.dto";
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
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsuarioController {
  constructor(private readonly userService: UsuarioService) {}

  @Get()
  async findAll(): Promise<UsuarioResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<UsuarioResponseDto> {
    return this.userService.findById(id);
  }

  @Post()
  async create(@Body() body: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    return this.userService.create(body);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    return this.userService.update(id, body);
  }

  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
