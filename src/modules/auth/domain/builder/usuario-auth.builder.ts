import { Perfil } from "@modules/permissoes/domain/permissoes.catalogo";
import { 
    UsuarioAuthEntity,
    UsuarioAuthEntityProps
} from "../models/usuario-auth.entity";

export class UsuarioAuthBuilder {
    usuarioAuth: Partial<UsuarioAuthEntity> = { perfil: Perfil.CORRETOR }

    constructor(id: bigint) {
        this.usuarioAuth.id = id;
    }

    withName(name: string): UsuarioAuthBuilder {
        this.usuarioAuth.name = name;
        return this;
    }
    withEmail(email: string): UsuarioAuthBuilder {
        this.usuarioAuth.email = email;
        return this;
    }
    withHashPassword(hashPassword: string): UsuarioAuthBuilder {
        this.usuarioAuth.senhaHash = hashPassword;
        return this;
    }
    withAnexoId(anexoId: bigint | null): UsuarioAuthBuilder {
        this.usuarioAuth.anexoId = anexoId;
        return this;
    }
    withPermissions(permissions: string[] | null): UsuarioAuthBuilder {
        this.usuarioAuth.permissoes = permissions;
        return this;
    }
    withStatus(status: string): UsuarioAuthBuilder {
        this.usuarioAuth.status = status;
        return this;
    }
    withPerfil(perfil: string): UsuarioAuthBuilder {
        this.usuarioAuth.perfil = perfil as Perfil;
        return this;
    }
    withTrocarSenha(trocarSenha: boolean): UsuarioAuthBuilder {
        this.usuarioAuth.trocarSenha = trocarSenha;
        return this;
    }
    build(): UsuarioAuthEntity {
        return {...this.usuarioAuth} as UsuarioAuthEntity;
    }

    restore(props: UsuarioAuthEntityProps): UsuarioAuthEntity {
        return new UsuarioAuthBuilder(props.id)
            .withName(props.name)
            .withEmail(props.email)
            .withHashPassword(props.senhaHash)
            .withAnexoId(props.anexoId)
            .withPermissions(props.permissoes)
            .withStatus(props.status)
            .withPerfil(props.perfil ?? Perfil.CORRETOR)
            .build();
    }

}