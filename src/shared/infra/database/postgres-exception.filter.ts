import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import type { Response } from "express";

const RESPOSTAS: Record<string, { status: number; message: string }> = {
  "23503": {
    status: HttpStatus.BAD_REQUEST,
    message: "Registro relacionado não encontrado ou ainda em uso.",
  },
  "23505": {
    status: HttpStatus.CONFLICT,
    message: "Já existe um registro com esses dados.",
  },
};

function codigoPostgres(erro: unknown): string | undefined {
  for (let atual = erro; atual && typeof atual === "object"; atual = (atual as { cause?: unknown }).cause) {
    const code = (atual as { code?: unknown }).code;
    if (typeof code === "string" && RESPOSTAS[code]) return code;
  }
  return undefined;
}

/** FK e unicidade do Postgres viram 400/409 em vez de 500. */
@Catch()
export class PostgresExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const code = codigoPostgres(exception);
    if (!code) return super.catch(exception, host);

    const { status, message } = RESPOSTAS[code];
    host.switchToHttp().getResponse<Response>().status(status).json({ statusCode: status, message });
  }
}
