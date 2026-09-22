import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSOES_KEY } from "@shared/decorators/permissoes.decorator";
import type { RequestAuthUser } from "@shared/guards/jwt-auth.guard";
import type { Request } from "express";

type RequestWithUser = Request & { user?: RequestAuthUser };

@Injectable()
export class PermissoesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissoesNecessarias = this.reflector.getAllAndOverride<string[]>(
      PERMISSOES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permissoesNecessarias || permissoesNecessarias.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      throw new UnauthorizedException("Usuário não autenticado.");
    }

    const permissoesUsuario = this.normalizePermissoes(request.user.permissoes);

    if (permissoesUsuario.includes("ADMIN")) {
      return true;
    }

    const possuiPermissoes = permissoesNecessarias.every((permissao) =>
      permissoesUsuario.includes(permissao.trim().toUpperCase()),
    );

    if (!possuiPermissoes) {
      throw new ForbiddenException(
        "Você não possui permissão para executar esta ação.",
      );
    }

    return true;
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
