import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PermissaoService } from "@modules/permissoes/application/services/permissao.service";
import { EmailService } from "@shared/infra/email/email.service";
import { compare, hash } from "bcryptjs";
import type { UsuarioAuthEntity } from "../../domain/models/usuario-auth.entity";
import {
  AUTH_USUARIO_REPOSITORY,
  type AuthUsuarioRepository,
} from "../../domain/repositories/auth-usuario.repository";
import { LoginDto } from "../dto/login.dto";
import type { RedefinirSenhaDto, TrocarSenhaDto } from "../dto/senha.dto";

export interface AuthUsuarioResponse {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  permissoes: string[];
  trocarSenha: boolean;
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
    private readonly emailService: EmailService,
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
        trocarSenha: usuario.trocarSenha,
      },
    };
  }

  async trocarSenha(usuarioId: string, dto: TrocarSenhaDto): Promise<void> {
    const usuario = await this.authUsuarioRepository.findById(this.parseId(usuarioId));
    if (!usuario) throw new UnauthorizedException("Usuário não encontrado.");
    if (!(await compare(dto.senhaAtual, usuario.senhaHash))) {
      throw new BadRequestException("Senha atual incorreta.");
    }
    if (dto.senhaAtual === dto.novaSenha) {
      throw new BadRequestException("A nova senha precisa ser diferente da atual.");
    }
    await this.authUsuarioRepository.atualizarSenha(usuario.id, await hash(dto.novaSenha, 10));
  }

  /** Responde igual exista ou não o e-mail, para não revelar quem tem conta. */
  async solicitarRecuperacao(email: string): Promise<void> {
    const usuario = await this.authUsuarioRepository.findByEmail(email.trim().toLowerCase());
    if (!usuario || usuario.status !== "ATIVO") return;

    const token = await this.jwtService.signAsync(
      { sub: usuario.id.toString(), tipo: "redefinir-senha" },
      { secret: this.segredoDeRedefinicao(usuario), expiresIn: "1h" },
    );
    const base = this.configService.get<string>("APP_URL") ?? "http://localhost:8080";
    const link = `${base.replace(/\/$/, "")}/redefinir-senha?token=${encodeURIComponent(token)}`;
    await this.emailService.enviar({
      para: usuario.email,
      assunto: "Redefinição de senha — Urbizzi",
      texto: `Olá, ${usuario.name}.\n\nPara criar uma nova senha, acesse:\n${link}\n\nO link vale por 1 hora e só pode ser usado uma vez. Se você não pediu, ignore este e-mail.`,
    });
  }

  async redefinirSenha(dto: RedefinirSenhaDto): Promise<void> {
    const invalido = new BadRequestException("Link inválido ou expirado. Peça um novo.");
    const payload = this.jwtService.decode<{ sub?: string; tipo?: string } | null>(dto.token);
    if (!payload?.sub || payload.tipo !== "redefinir-senha" || !/^\d+$/.test(payload.sub)) throw invalido;

    const usuario = await this.authUsuarioRepository.findById(BigInt(payload.sub));
    if (!usuario) throw invalido;
    try {
      await this.jwtService.verifyAsync(dto.token, { secret: this.segredoDeRedefinicao(usuario) });
    } catch {
      throw invalido;
    }
    await this.authUsuarioRepository.atualizarSenha(usuario.id, await hash(dto.novaSenha, 10));
  }

  /** O hash atual entra no segredo: depois de trocar a senha, o link antigo para de valer. */
  private segredoDeRedefinicao(usuario: UsuarioAuthEntity) {
    const segredo = this.configService.get<string>("JWT_SECRET") ?? "";
    return `${segredo}:${usuario.senhaHash}`;
  }

  private parseId(valor: string): bigint {
    if (!/^\d+$/.test(valor)) throw new UnauthorizedException("Usuário não encontrado.");
    return BigInt(valor);
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
