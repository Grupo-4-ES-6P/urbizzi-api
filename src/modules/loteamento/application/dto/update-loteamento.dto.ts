import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdateLoteamentoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descricao?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  situacao?: string;

  @IsOptional()
  @IsBoolean()
  publicado?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idBairro?: number;
}
