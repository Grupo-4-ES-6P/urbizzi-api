import { Body, Controller, Post } from "@nestjs/common";
import { LoginDto } from "../../application/dto/login.dto";
import type { AuthLoginResponse } from "../../application/services/auth.service";
import { AuthService } from "../../application/services/auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginDto): Promise<AuthLoginResponse> {
    return this.authService.login(body);
  }
}
