import { Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard, type RequestAuthUser } from "@shared/guards/jwt-auth.guard";
import { LoginDto } from "../../application/dto/login.dto";
import { RecuperarSenhaDto, RedefinirSenhaDto, TrocarSenhaDto } from "../../application/dto/senha.dto";
import type { AuthLoginResponse } from "../../application/services/auth.service";
import { AuthService } from "../../application/services/auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginDto): Promise<AuthLoginResponse> {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Post("trocar-senha")
  async trocarSenha(@Body() body: TrocarSenhaDto, @Req() req: { user: RequestAuthUser }): Promise<void> {
    await this.authService.trocarSenha(req.user.sub, body);
  }

  @HttpCode(202)
  @Post("recuperar-senha")
  async recuperarSenha(@Body() body: RecuperarSenhaDto): Promise<void> {
    await this.authService.solicitarRecuperacao(body.email);
  }

  @HttpCode(204)
  @Post("redefinir-senha")
  async redefinirSenha(@Body() body: RedefinirSenhaDto): Promise<void> {
    await this.authService.redefinirSenha(body);
  }
}
