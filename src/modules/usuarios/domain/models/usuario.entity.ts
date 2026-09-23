export class Usuario {
  private readonly _id?: bigint;
  private _email: string;
  private _password: string;         // sempre armazenado como hash
  private _jogadorId?: bigint;       // FK opcional para módulo de jogadores
  private _administradorId?: bigint;       // FK opcional para módulo de administradores
  private _permissions: string[];
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: bigint, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  // getters...
  get id() { return this._id; }
  get email() { return this._email; }
  get password() { return this._password; }
  get jogadorId() { return this._jogadorId; }
  get administradorId() { return this._administradorId; }
  get permissions() { return this._permissions; }

  // builders (padrão fluente)...
  withEmail(email: string) { this._email = email; return this; }
  withPassword(password: string) { this._password = password; return this; }
  withPermissions(permissions: string[]) { this._permissions = permissions; return this; }

  static restore(props?: {
    id?: bigint;
    email: string;
    password: string;
    jogadorId?: bigint | null;
    administradorId?: bigint | null;
    permissions: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Usuario | null {
    if (!props) return null;
    const user = new Usuario(props.id, props.createdAt, props.updatedAt);
    user._email = props.email;
    user._password = props.password;
    user._jogadorId = props.jogadorId ?? undefined;
    user._administradorId = props.administradorId ?? undefined;
    user._permissions = props.permissions ?? [];
    return user;
  }
}