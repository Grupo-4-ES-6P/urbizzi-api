import { Lote, type LoteProps } from "../model/lote.entity";

export class LoteBuilder {
    private props: Partial<LoteProps> = { detalhes: {} };

    constructor(id?: bigint) {
        this.props.id = id;
    }

    withMatricula(matricula?: string | null): LoteBuilder {
        this.props.matricula = matricula ?? null;
        return this;
    }
    withTipo(tipo: string): LoteBuilder {
        this.props.tipo = tipo;
        return this;
    }
    withAreaQuadrada(areaQuadrada?: number | null): LoteBuilder {
        this.props.areaQuadrada = areaQuadrada ?? null;
        return this;
    }
    withValor(valor?: number | null): LoteBuilder {
        this.props.valor = valor ?? null;
        return this;
    }
    withEstado(estado: string): LoteBuilder {
        this.props.estado = estado;
        return this;
    }
    withInformacoesComplementares(informacoes?: string | null): LoteBuilder {
        this.props.informacoesComplementares = informacoes ?? null;
        return this;
    }
    withLatitude(latitude?: number | null): LoteBuilder {
        this.props.latitude = latitude ?? null;
        return this;
    }
    withLongitude(longitude?: number | null): LoteBuilder {
        this.props.longitude = longitude ?? null;
        return this;
    }
    withPublicado(publicado: boolean): LoteBuilder {
        this.props.publicado = publicado;
        return this;
    }
    withIdQuadra(idQuadra?: bigint | null): LoteBuilder {
        this.props.idQuadra = idQuadra ?? null;
        return this;
    }
    withIdLogradouro(idLogradouro?: bigint | null): LoteBuilder {
        this.props.idLogradouro = idLogradouro ?? null;
        return this;
    }
    withIdAnexo(idAnexo?: bigint | null): LoteBuilder {
        this.props.idAnexo = idAnexo ?? null;
        return this;
    }
    withDetalhes(detalhes?: Record<string, unknown> | null): LoteBuilder {
        this.props.detalhes = detalhes ?? {};
        return this;
    }
    withCreatedAt(createdAt: Date): LoteBuilder {
        this.props.createdAt = createdAt;
        return this;
    }
    withUpdatedAt(updatedAt: Date): LoteBuilder {
        this.props.updatedAt = updatedAt;
        return this;
    }
    build(): Lote {
        return new Lote(this.props as LoteProps);
    }

    static restore(props?: LoteProps | null): Lote | null {
        return props ? new Lote(props) : null;
    }
}
