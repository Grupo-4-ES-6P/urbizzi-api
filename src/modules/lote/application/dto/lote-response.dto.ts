export class ResponseLoteDto {
    id!: string;
    matricula?: string;
    tipo!: string;
    areaQuadrada!: number;
    valor!: number;
    estado!: string;
    informacoesComplementares?: string;
    latitude!: number;
    longitude!: number;
    publicado!: boolean;
    idQuadra!: string;
    idLogradouro!: string;
    idAnexo?: string;
    createdAt!: string;
    updatedAt!: string;
}