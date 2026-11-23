import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  IsObject,
  MaxLength,
} from "class-validator";

export class UpdatePropostaDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d+(?:\.\d+)?$/)
  valor?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  condicoes?: string;

  @IsOptional()
  @IsString()
  observacoes?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  status?: string;

  @IsOptional()
  @IsString()
  justificativa?: string | null;

  @IsOptional()
  @IsDateString()
  prazoResposta?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idLote?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idCliente?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  codigo?: string | null;

  @IsOptional()
  @IsObject()
  detalhes?: Record<string, unknown>;
}
