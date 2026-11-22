import { ApiProperty } from "@nestjs/swagger";
import {
  IsNumber,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsDate,
} from "class-validator";

export class UpdateLoteDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(516)
    matricula?: string | null | undefined;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(128)
    tipo?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    areaQuadrada?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    valor?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(256)
    estado?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(1024)
    informacoesComplementares?: string | null | undefined;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    publicado?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsInt()
    idQuadra?: bigint;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsInt()
    idLogradouro?: bigint;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsInt()
    idAnexo?: bigint;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    createdAt?: Date | null | undefined;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    updatedAt?: Date | null | undefined; 

}