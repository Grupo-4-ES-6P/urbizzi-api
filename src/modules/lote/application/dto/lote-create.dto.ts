import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export const ESTADOS_LOTE = ["disponivel", "reservado", "vendido", "bloqueado"] as const;

export class CreateLoteDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(516)
    matricula?: string | null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    tipo!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    areaQuadrada?: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    valor?: number | null;

    @ApiProperty({ enum: ESTADOS_LOTE })
    @IsIn(ESTADOS_LOTE)
    estado!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(1024)
    informacoesComplementares?: string | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number | null;

    @ApiProperty()
    @IsBoolean()
    publicado!: boolean;

    @ApiProperty({ required: false, description: "Vazio para imóvel avulso ou rascunho" })
    @IsOptional()
    @IsInt()
    @Min(1)
    idQuadra?: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    idLogradouro?: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    idAnexo?: number | null;

    @ApiProperty({ required: false, description: "Dados de tela do imóvel (código, fotos, bloqueio...)" })
    @IsOptional()
    @IsObject()
    detalhes?: Record<string, unknown>;
}
