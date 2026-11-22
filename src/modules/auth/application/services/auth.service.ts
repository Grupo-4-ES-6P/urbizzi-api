import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PermissaoService } from "@modules/permissoes/application/services/permissao.service";
import { compare } from "bcryptjs";
import {
  AUTH_USUARIO_REPOSITORY,
  type AuthUsuarioRepository,
} from "../../domain/repositories/auth-usuario.repository";
import { LoginDto } from "../dto/login.dto";

export interface AuthUsuarioResponse {
  id: string;
  nome: string;
  email: string;
  perfil: string;
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
    private readonly permissaoService: PermissaoService,
  ) {}

  async login(data: LoginDto): Promise<AuthLoginResponse> {
    const email = data.email.trim().toLowerCase();
    const usuario = await this.authUsuarioRepository.findByEmail(email);

    if (!usuario) {
      throw new UnauthorizedException("Email ou senha inválidos.");
    }

    if (usuario.status !== "ATIVO") {
      throw new UnauthorizedException(
        "Usuário inativo ou aguardando ativação.",
      );
    }

    const senhaValida = await compare(data.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedException("Email ou senha inválidos.");
    }

    const permissoes = await this.permissaoService.permissoesDoUsuario(
      usuario.perfil,
      this.parsePermissoes(usuario.permissoes),
    );

    const payload = {
      sub: usuario.id.toString(),
      email: usuario.email,
      permissoes,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    await this.authUsuarioRepository.registrarAcesso(usuario.id);
    const expiresIn = this.configService.get<string>("JWT_EXPIRES_IN") ?? "1h";

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn,
      usuario: {
        id: payload.sub,
        nome: usuario.name,
        email: payload.email,
        perfil: usuario.perfil,
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
