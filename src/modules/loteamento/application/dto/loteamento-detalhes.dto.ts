import { Transform } from "class-transformer";
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from "class-validator";

const vazioParaNull = ({ value }: { value: unknown }) =>
  typeof value === "string" && value.trim() === "" ? null : value;

/** Campos de cadastro do loteamento além do DER original. */
export class LoteamentoDetalhesDto {
  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(20)
  codigo?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsDateString()
  dataAprovacao?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(9)
  cep?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(256)
  endereco?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(120)
  bairro?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(120)
  cidade?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @Length(2, 2)
  uf?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(60)
  matriculaMae?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  areaTotal?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  areaLoteavel?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(160)
  cartorio?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(60)
  numeroRegistro?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(60)
  licencaAmbiental?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsDateString()
  validadeLicenca?: string | null;
}
