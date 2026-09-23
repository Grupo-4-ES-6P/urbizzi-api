import { Permissoes } from "@shared/decorators/permissoes.decorator";

export const RequirePermissions = (...permissions: string[]) =>
  Permissoes(...permissions);
