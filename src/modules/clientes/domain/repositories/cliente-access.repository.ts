export const CLIENTE_ACCESS_REPOSITORY = Symbol("CLIENTE_ACCESS_REPOSITORY");

export type StatusAcessoCliente = "PENDENTE_ATIVACAO" | "ATIVO" | "INATIVO";

export interface ClienteAccessRepository {
  emailExists(email: string): Promise<boolean>;
  createForClient(input: {
    clienteId: bigint;
    email: string;
    passwordHash: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  renewInvitation(input: {
    clienteId: bigint;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<string>;
  activate(input: { tokenHash: string; passwordHash: string }): Promise<void>;
  changeStatus(clienteId: bigint, status: StatusAcessoCliente): Promise<void>;
  deactivateClient(clienteId: bigint): Promise<void>;
}
