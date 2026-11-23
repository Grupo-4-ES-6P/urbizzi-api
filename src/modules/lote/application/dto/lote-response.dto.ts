export class ResponseLoteDto {
    id!: string;
    matricula!: string | null;
    tipo!: string;
    areaQuadrada!: number | null;
    valor!: number | null;
    estado!: string;
    informacoesComplementares!: string | null;
    latitude!: number | null;
    longitude!: number | null;
    publicado!: boolean;
    idQuadra!: string | null;
    idLogradouro!: string | null;
    idAnexo!: string | null;
    detalhes!: Record<string, unknown>;
    createdAt!: string;
    updatedAt!: string;
}
