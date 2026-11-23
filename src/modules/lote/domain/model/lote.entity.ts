export interface LoteProps {
    id?: bigint;
    matricula?: string | null;
    tipo: string;
    areaQuadrada?: number | null;
    valor?: number | null;
    estado: string;
    informacoesComplementares?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    publicado: boolean;
    idQuadra?: bigint | null;
    idLogradouro?: bigint | null;
    idAnexo?: bigint | null;
    detalhes?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Lote {
    readonly id?: bigint;
    readonly matricula: string | null;
    readonly tipo: string;
    readonly areaQuadrada: number | null;
    readonly valor: number | null;
    readonly estado: string;
    readonly informacoesComplementares: string | null;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly publicado: boolean;
    readonly idQuadra: bigint | null;
    readonly idLogradouro: bigint | null;
    readonly idAnexo: bigint | null;
    readonly detalhes: Record<string, unknown>;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: LoteProps) {
        this.id = props.id;
        this.matricula = props.matricula?.trim() || null;
        this.tipo = props.tipo;
        this.areaQuadrada = props.areaQuadrada ?? null;
        this.valor = props.valor ?? null;
        this.estado = props.estado;
        this.informacoesComplementares = props.informacoesComplementares ?? null;
        this.latitude = props.latitude ?? null;
        this.longitude = props.longitude ?? null;
        this.publicado = props.publicado;
        this.idQuadra = props.idQuadra ?? null;
        this.idLogradouro = props.idLogradouro ?? null;
        this.idAnexo = props.idAnexo ?? null;
        this.detalhes = props.detalhes ?? {};
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
