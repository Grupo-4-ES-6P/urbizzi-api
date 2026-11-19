import { 
    Usuario, 
    StatusUsuario, 
    UsuarioProps 
} from "../models/usuario.entity";

export class UsuarioBuilder {
    private usuario: Partial<Usuario> = {status: StatusUsuario.PENDENTE_ATIVACAO}

    constructor (id?: bigint) {
        this.usuario.id = id;
    }
    
    // builders (padrão fluente)...
    withName(name: string): UsuarioBuilder {
        this.usuario.name = name;
        return this;
    }
    withEmail(email: string): UsuarioBuilder {
        this.usuario.email = email;
        return this;
    }
    withPassword(password: string): UsuarioBuilder {
        this.usuario.password = password;
        return this;
    }
    withPermissions(permissions: string[]): UsuarioBuilder {
        this.usuario.permissions = permissions;
        return this;
    }
    withStatus(status: StatusUsuario | string): UsuarioBuilder {
        switch(status) {
            case "PENDENTE_ATIVACAO": 
                this.usuario.status = StatusUsuario.PENDENTE_ATIVACAO;
                break;
            case "ATIVO":
                this.usuario.status = StatusUsuario.ATIVO;
                break;
            default:
                this.usuario.status = StatusUsuario.INATIVO;
        }
        return this;
    }
    withAnexoId(anexoId?: bigint): UsuarioBuilder {
        this.usuario.anexoId = anexoId;
        return this;
    }
    withUpdatedAt(updated_at: Date): UsuarioBuilder {
        this.usuario.dateUpdated = updated_at;
        return this;
    }
    build(): Usuario {
        return {...this.usuario} as Usuario;
    }

    static restore(props?: UsuarioProps): Usuario | null {
    if (!props) return null;
    const user = new UsuarioBuilder(props.id)
        .withName(props.name)
        .withEmail(props.email)
        .withPassword(props.password)
        .withPermissions(props.permissions)
        .withStatus(props.status!)
        .withAnexoId(props.anexoId!)
        .withUpdatedAt(props.updatedAt!)
        .build();
    return user;
  }
}