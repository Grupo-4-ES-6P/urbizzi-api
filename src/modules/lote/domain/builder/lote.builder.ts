import {
    Lote,
    LoteProps
} from "@modules/lote/domain/model/lote.entity"

export class LoteBuilder {
    private lote: Partial<Lote> = {}

    constructor(id: bigint | undefined, idQuadra: bigint, idLogradouro: bigint) {
        this.lote.id = id;
        this.lote.idQuadra = idQuadra;
        this.lote.idLogradouro = idLogradouro;
    }

    // builders
    withMatricula(matricula: string): LoteBuilder {
        this.lote.matricula = matricula;
        return this;
    }
    withNumeroLote(numeroLote: number): LoteBuilder {
        this.lote.numeroLote = numeroLote;
        return this;
    }
    withTipo(tipo: string): LoteBuilder {
        this.lote.tipo = tipo;
        return this;
    }
    withAreaQuadrada(areaQuadrada: number): LoteBuilder {
        this.lote.areaQuadrada = areaQuadrada;
        return this;
    }
    withValor(valor: number): LoteBuilder {
        this.lote.valor = valor;
        return this;
    }
    withEstado(estado: string): LoteBuilder {
        this.lote.estado = estado;
        return this;
    }
    withInformacoesComplementares(informacoesComplementares: string): LoteBuilder {
        this.lote.informacoesComplementares = informacoesComplementares;
        return this;
    }
    withLatitude(latitude: number): LoteBuilder {
        this.lote.latitude = latitude;
        return this;
    }
    withLongitude(longitude: number): LoteBuilder {
        this.lote.longitude = longitude;
        return this;
    }
    withPublicado(publicado: boolean): LoteBuilder {
        this.lote.publicado = publicado;
        return this;
    }
    withIdQuadra(idQuadra: bigint): LoteBuilder {
        this.lote.idQuadra = idQuadra;
        return this;
    }
    withIdLogradouro(idLogradouro: bigint): LoteBuilder {
        this.lote.idLogradouro = idLogradouro;
        return this;
    }
    withIdAnexo(idAnexo: bigint): LoteBuilder {
        this.lote.idAnexo = idAnexo;
        return this;
    }
    withCreatedAt(createdAt: Date): LoteBuilder {
        this.lote.createdAt = createdAt;
        return this;
    }
    withUpdatedAt(updatedAt: Date): LoteBuilder {
        this.lote.updatedAt = updatedAt;
        return this;
    }
    build() {
        return {...this.lote} as Lote;
    }

    static restore(props?: LoteProps): Lote | null {
        if(!props) return null;
        const lote = new LoteBuilder(props.id, props.idQuadra, props.idLogradouro)
            .withMatricula(props.matricula!)
            .withNumeroLote(props.numeroLote!)
            .withTipo(props.tipo!)
            .withAreaQuadrada(props.areaQuadrada!)
            .withValor(props.valor!)
            .withEstado(props.estado!)
            .withInformacoesComplementares(props.informacoesComplementares!)
            .withLatitude(props.latitude!)
            .withLongitude(props.longitude!)
            .withPublicado(props.publicado!)
            .withIdAnexo(props.idAnexo!)
            .withCreatedAt(props.createdAt!)
            .withUpdatedAt(props.updatedAt!)
            .build();
        return lote;
    }
}