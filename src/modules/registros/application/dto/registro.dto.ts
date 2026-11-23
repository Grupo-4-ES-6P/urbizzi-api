import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class RegistroDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  codigo?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  idLote?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  idCliente?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  status?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  data?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  valor?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  detalhes?: Record<string, unknown>;
}

/** Formulário de interesse do catálogo público (sem login). */
export class InteressePublicoDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  idLote!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome!: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(256)
  email!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  mensagem?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  codigo?: string;
}
