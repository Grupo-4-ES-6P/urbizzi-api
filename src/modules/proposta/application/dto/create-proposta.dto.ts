import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from "class-validator";

export class CreatePropostaDto {
  @IsString()
  @Matches(/^\d+(?:\.\d+)?$/)
  valor!: string;

  @IsString()
  @IsNotEmpty()
  condicoes!: string;

  @IsOptional()
  @IsString()
  observacoes?: string | null;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsOptional()
  @IsString()
  justificativa?: string | null;

  @IsOptional()
  @IsDateString()
  prazoResposta?: string | null;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  idLote!: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  idCliente!: number;
}
