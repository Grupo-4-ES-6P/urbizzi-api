import "reflect-metadata";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { LoteamentoDetalhesDto } from "./loteamento-detalhes.dto";

export class CreateLoteamentoDto extends LoteamentoDetalhesDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsString()
  @IsNotEmpty()
  situacao!: string;

  @IsOptional()
  @IsBoolean()
  publicado?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idBairro?: number | null;
}
