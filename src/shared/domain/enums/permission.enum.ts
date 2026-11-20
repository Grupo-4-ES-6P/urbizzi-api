export enum Permission {
  // user
  USER_WRITE = "user:write",
  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",

  // adm
  ADMIN_WRITE = "admin:write",
  ADMIN_READ = "admin:read",
  ADMIN_UPDATE = "admin:update",
  ADMIN_DELETE = "admin:delete",

  // quadra

  QUADRA_WRITE = "quadra:write",
  QUADRA_READ = "quadra:read",
  QUADRA_UPDATE = "quadra:update",
  QUADRA_DELETE = "quadra:delete",

  CLIENTE_CRIAR = "CLIENTE_CRIAR",
  CLIENTE_VISUALIZAR = "CLIENTE_VISUALIZAR",
  CLIENTE_ATUALIZAR = "CLIENTE_ATUALIZAR",
  CLIENTE_DESATIVAR = "CLIENTE_DESATIVAR",
  CLIENTE_REATIVAR = "CLIENTE_REATIVAR",

  ANEXO_CRIAR = "ANEXO_CRIAR",
  ANEXO_VISUALIZAR = "ANEXO_VISUALIZAR",
  ANEXO_ATUALIZAR = "ANEXO_ATUALIZAR",
  ANEXO_EXCLUIR = "ANEXO_EXCLUIR",
}
