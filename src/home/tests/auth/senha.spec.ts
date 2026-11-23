import { AuthService } from "@modules/auth/application/services/auth.service";
import { UsuarioAuthEntity } from "@modules/auth/domain/models/usuario-auth.entity";
import type { AuthUsuarioRepository } from "@modules/auth/domain/repositories/auth-usuario.repository";
import type { PermissaoService } from "@modules/permissoes/application/services/permissao.service";
import { BadRequestException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { EmailService } from "@shared/infra/email/email.service";
import { compare, hashSync } from "bcryptjs";

const SENHA = "senha-antiga";

function cenario() {
  let usuario = new UsuarioAuthEntity({
    id: 5n,
    name: "Ana",
    email: "ana@urbizzi.com",
    senhaHash: hashSync(SENHA, 4),
    anexoId: null,
    permissoes: [],
    status: "ATIVO",
  });
  const repository: jest.Mocked<AuthUsuarioRepository> = {
    findByEmail: jest.fn(async () => usuario),
    findById: jest.fn(async () => usuario),
    registrarAcesso: jest.fn(),
    atualizarSenha: jest.fn(async (_id, senhaHash) => {
      usuario = new UsuarioAuthEntity({ ...usuario, senhaHash, permissoes: [] });
    }),
  };
  const email = { enviar: jest.fn() };
  const config = { get: (chave: string) => ({ JWT_SECRET: "segredo", APP_URL: "http://app" })[chave] };
  const service = new AuthService(
    repository,
    new JwtService({ secret: "segredo" }),
    config as unknown as ConfigService,
    {} as PermissaoService,
    email as unknown as EmailService,
  );
  const tokenDoEmail = () => decodeURIComponent(String(email.enviar.mock.calls.at(-1)?.[0].texto.match(/token=([^\s]+)/)?.[1]));
  return { service, repository, email, tokenDoEmail, atual: () => usuario };
}

describe("Senha: troca e recuperação", () => {
  it("troca a senha conferindo a atual", async () => {
    const { service, atual } = cenario();

    await expect(service.trocarSenha("5", { senhaAtual: "errada", novaSenha: "nova-senha-1" })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await service.trocarSenha("5", { senhaAtual: SENHA, novaSenha: "nova-senha-1" });
    expect(await compare("nova-senha-1", atual().senhaHash)).toBe(true);
  });

  it("envia o link por e-mail e redefine a senha uma única vez", async () => {
    const { service, email, tokenDoEmail, atual } = cenario();

    await service.solicitarRecuperacao(" ANA@urbizzi.com ");
    expect(email.enviar).toHaveBeenCalledWith(expect.objectContaining({ para: "ana@urbizzi.com" }));
    const token = tokenDoEmail();

    await service.redefinirSenha({ token, novaSenha: "outra-senha-1" });
    expect(await compare("outra-senha-1", atual().senhaHash)).toBe(true);

    // O hash mudou: o mesmo link não vale de novo.
    await expect(service.redefinirSenha({ token, novaSenha: "terceira-1" })).rejects.toBeInstanceOf(BadRequestException);
  });

  it("não revela se o e-mail existe", async () => {
    const { service, repository, email } = cenario();
    repository.findByEmail.mockResolvedValue(null);

    await expect(service.solicitarRecuperacao("ninguem@x.com")).resolves.toBeUndefined();
    expect(email.enviar).not.toHaveBeenCalled();
  });

  it("recusa token de login no lugar do link de redefinição", async () => {
    const { service } = cenario();
    const tokenDeLogin = await new JwtService({ secret: "segredo" }).signAsync({ sub: "5" });

    await expect(service.redefinirSenha({ token: tokenDeLogin, novaSenha: "qualquer-1" })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
