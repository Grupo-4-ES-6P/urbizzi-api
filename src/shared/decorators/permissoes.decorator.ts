import { SetMetadata } from "@nestjs/common";

export const PERMISSOES_KEY = "permissoes";

export const Permissoes = (...permissoes: string[]) =>
  SetMetadata(PERMISSOES_KEY, permissoes);
