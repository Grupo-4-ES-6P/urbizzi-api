import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "@shared/decorators/public.decorator";
import type { Request } from "express";

export interface RequestAuthUser {
  sub: string;
  email: string;
  idJogador: string | null;
  idAdministrador: string | null;
  permissoes: string[];
  iat?: number;
  exp?: number;
}

type RequestWithUser = Request & { user?: RequestAuthUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Token não informado.");
    }

    try {
      const payload = await this.jwtService.verifyAsync<RequestAuthUser>(
        token,
        {
          secret:
            this.configService.get<string>("JWT_SECRET") ??
            "backend-quadras-dev-secret",
        },
      );

      request.user = {
        ...payload,
        permissoes: this.normalizePermissoes(payload.permissoes),
      };
    } catch {
      throw new UnauthorizedException("Token inválido.");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      return null;
    }

    return token;
  }

  private normalizePermissoes(
    permissoes: string[] | null | undefined,
  ): string[] {
    if (!permissoes) {
      return [];
    }

    return permissoes
      .map((permissao) => permissao.trim().toUpperCase())
      .filter(Boolean);
  }
}
