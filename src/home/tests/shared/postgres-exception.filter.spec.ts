import type { ArgumentsHost } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { PostgresExceptionFilter } from "@shared/infra/database/postgres-exception.filter";

const makeHost = () => {
  const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { host, response };
};

describe("PostgresExceptionFilter", () => {
  it("traduz FK inexistente (23503) em 400, mesmo dentro do erro do Drizzle", () => {
    const { host, response } = makeHost();
    const erroDrizzle = Object.assign(new Error("Failed query"), { cause: { code: "23503" } });

    new PostgresExceptionFilter().catch(erroDrizzle, host);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("traduz duplicidade (23505) em 409", () => {
    const { host, response } = makeHost();

    new PostgresExceptionFilter().catch({ code: "23505" }, host);

    expect(response.status).toHaveBeenCalledWith(409);
  });

  it("deixa os outros erros com o tratamento padrão do Nest", () => {
    const padrao = jest.spyOn(BaseExceptionFilter.prototype, "catch").mockImplementation(() => undefined);
    const { host, response } = makeHost();

    new PostgresExceptionFilter().catch(new Error("outro"), host);

    expect(padrao).toHaveBeenCalled();
    expect(response.status).not.toHaveBeenCalled();
    padrao.mockRestore();
  });
});
