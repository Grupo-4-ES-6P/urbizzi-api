import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import {
  AUTH_USUARIO_REPOSITORY,
  type AuthUsuarioRepository,
} from "../../domain/repositories/auth-usuario.repository";
import { LoginDto } from "../dto/login.dto";

export interface AuthUsuarioResponse {
  id: string;
  email: string;
  idJogador: string | null;
  idAdministrador: string | null;
  permissoes: string[];
}

export interface AuthLoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  usuario: AuthUsuarioResponse;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_USUARIO_REPOSITORY)
    private readonly authUsuarioRepository: AuthUsuarioRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(data: LoginDto): Promise<AuthLoginResponse> {
    const email = data.email.trim().toLowerCase();
    const usuario = await this.authUsuarioRepository.findByEmail(email);

    if (!usuario) {
      throw new UnauthorizedException("Email ou senha inválidos.");
    }

    const senhaValida = await compare(data.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedException("Email ou senha inválidos.");
    }

    const permissoes = this.parsePermissoes(usuario.permissoes);

    const payload = {
      sub: usuario.id.toString(),
      email: usuario.email,
      idJogador: usuario.idJogador ? usuario.idJogador.toString() : null,
      idAdministrador: usuario.idAdministrador
        ? usuario.idAdministrador.toString()
        : null,
      permissoes,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = this.configService.get<string>("JWT_EXPIRES_IN") ?? "1h";

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn,
      usuario: {
        id: payload.sub,
        email: payload.email,
        idJogador: payload.idJogador,
        idAdministrador: payload.idAdministrador,
        permissoes,
      },
    };
  }

  private parsePermissoes(permissoes: string[] | string | null): string[] {
    if (!permissoes) {
      return [];
    }

    const listaPermissoes = Array.isArray(permissoes)
      ? permissoes
      : permissoes.split(",");

    return listaPermissoes.map((permissao) => permissao.trim()).filter(Boolean);
  }
}
