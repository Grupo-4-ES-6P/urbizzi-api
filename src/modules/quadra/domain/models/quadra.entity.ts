export interface QuadraEntityProps {
    id?: bigint;
    identificacao: string;
    idLoteamento: bigint;
    area?: number | null;
    testadaPara?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Quadra {
    readonly id?: bigint;
    readonly identificacao: string;
    readonly idLoteamento: bigint;
    readonly area: number | null;
    readonly testadaPara: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: QuadraEntityProps) {
        this.id = props.id;
        this.identificacao = props.identificacao;
        this.idLoteamento = props.idLoteamento;
        this.area = props.area ?? null;
        this.testadaPara = props.testadaPara ?? null;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
