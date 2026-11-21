import { 
    Quadra,
    QuadraEntityProps
} from "../models/quadra.entity"

export class QuadraBuilder {
    private quadra: Partial<Quadra> = {};

    constructor(id?: bigint) {
        this.quadra.id = id;
    }

    withIdentificacao(identificacao?: string | undefined): QuadraBuilder {
        this.quadra.identificacao = identificacao;
        return this;
    }
    withIdLoteamento(idLoteamento?: bigint | undefined): QuadraBuilder {
        this.quadra.idLoteamento = idLoteamento;
        return this;
    }
    withCreatedAt(createdAt: Date): QuadraBuilder {
        this.quadra.createdAt = createdAt;
        return this;
    }
    withUpdatedAt(updatedAt: Date): QuadraBuilder {
        this.quadra.updatedAt = updatedAt;
        return this;
    }
    build(): Quadra {
        return {...this.quadra} as Quadra;
    }
    
    static restore(props: QuadraEntityProps) {
        return new QuadraBuilder(props.id)
            .withIdentificacao(props.identificacao)
            .withIdLoteamento(props.idLoteamento)
            .withCreatedAt(props.createdAt ?? new Date())
            .withUpdatedAt(props.updatedAt ?? new Date())
            .build()
    }
}