import "reflect-metadata";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from "class-validator";

const vazioParaNull = ({ value }: { value: unknown }) =>
  typeof value === "string" && value.trim() === "" ? null : value;

export const RESULTADOS_CONTATO = [
  "em_andamento",
  "positivo",
  "sem_retorno",
  "negativo",
  "novo",
] as const;

export class EnderecoClienteDto {
  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(9)
  cep?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(256)
  logradouro?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(20)
  numero?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(120)
  complemento?: string | null;

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
  pais?: string | null;
}

export class ContatoComercialDto {
  @IsDateString()
  data!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  canal!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  responsavel!: string;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(64)
  imovelId?: string | null;

  @IsString()
  @IsNotEmpty()
  assunto!: string;

  @IsIn(RESULTADOS_CONTATO)
  resultado!: (typeof RESULTADOS_CONTATO)[number];
}

/** Campos comuns ao cadastro e à edição de cliente. */
export class ClienteComplementoDto {
  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(20)
  celular?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(20)
  rg?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsDateString()
  dataNascimento?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(30)
  estadoCivil?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(120)
  profissao?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(256)
  responsavel?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(64)
  imovelInteresseId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => EnderecoClienteDto)
  endereco?: EnderecoClienteDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContatoComercialDto)
  contatos?: ContatoComercialDto[];
}
