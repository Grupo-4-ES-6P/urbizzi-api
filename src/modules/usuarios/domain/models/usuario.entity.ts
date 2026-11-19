export enum StatusUsuario {
  PENDENTE_ATIVACAO = "PENDENTE_ATIVACAO",
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}

export interface UsuarioProps {
  id?: bigint;
  name: string;
  email: string;
  password: string;
  permissions: string[];
  status?: StatusUsuario | `${StatusUsuario}`;
  anexoId?: bigint | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Usuario {
  private _id?: bigint;
  private _name?: string;
  private _email?: string;
  private _password?: string; // sempre armazenado como hash
  private _permissions?: string[];
  private _status?: StatusUsuario;
  private _anexoId?: bigint;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(date?: Date) {
    this._createdAt = date ?? new Date();
  }

  // getters...
  get id() {
    return this._id ?? BigInt(0);
  }
  get name() {
    return this._name ?? '';
  }
  get email() {
    return this._email ?? '';
  }
  get password() {
    return this._password ?? '';
  }
  get permissions() {
    return this._permissions ?? [];
  }
  get status() {
    return this._status ?? StatusUsuario.INATIVO;
  }
  get anexoId() {
    return this._anexoId ?? BigInt(0);
  }
  get dateCreated() {
    return this._createdAt;
  }
  get dateUpdated() {
    return this._updatedAt ?? new Date();
  }

  //setters
  set id(id: bigint) {
    if (this._id != undefined) {
      throw "id alredy defined lmao";
    } 
    this._id = id;
  }
  set name(name: String) {
    this.name = name;
  }
  set email(email: string) {
    this._email = email;
  }
  set password(password: string) {
    this._password = password;
  }
  set permissions(permissions: string[]) {
    this._permissions = permissions;
  }
  set status(status: StatusUsuario) {
    this._status = status;
  }
  set anexoId(anexoId: bigint) {
    this._anexoId = anexoId;
  }
  set dateUpdated(dateUpdated: Date) {
    this._updatedAt = dateUpdated;
  }

}
