import { Quadra, type QuadraEntityProps } from "../models/quadra.entity";

export class QuadraBuilder {
    private props: Partial<QuadraEntityProps> = {};

    constructor(id?: bigint) {
        this.props.id = id;
    }

    withIdentificacao(identificacao: string): QuadraBuilder {
        this.props.identificacao = identificacao;
        return this;
    }
    withIdLoteamento(idLoteamento: bigint): QuadraBuilder {
        this.props.idLoteamento = idLoteamento;
        return this;
    }
    withArea(area?: number | null): QuadraBuilder {
        this.props.area = area ?? null;
        return this;
    }
    withTestadaPara(testadaPara?: string | null): QuadraBuilder {
        this.props.testadaPara = testadaPara ?? null;
        return this;
    }
    withCreatedAt(createdAt: Date): QuadraBuilder {
        this.props.createdAt = createdAt;
        return this;
    }
    withUpdatedAt(updatedAt: Date): QuadraBuilder {
        this.props.updatedAt = updatedAt;
        return this;
    }
    build(): Quadra {
        return new Quadra(this.props as QuadraEntityProps);
    }

    static restore(props?: QuadraEntityProps | null): Quadra | null {
        if (!props) return null;
        return new QuadraBuilder(props.id)
            .withIdentificacao(props.identificacao)
            .withIdLoteamento(props.idLoteamento)
            .withArea(props.area)
            .withTestadaPara(props.testadaPara)
            .withCreatedAt(props.createdAt ?? new Date())
            .withUpdatedAt(props.updatedAt ?? new Date())
            .build();
    }
}
