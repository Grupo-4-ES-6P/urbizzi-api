import { ApiProperty } from "@nestjs/swagger";
import {
  IsNumber,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDecimal,
  IsBoolean,
  IsDate,
} from "class-validator";

export class CreateLoteDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(516)
    matricula?: string | null | undefined;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    tipo!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsDecimal()
    areaQuadrada!: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsDecimal()
    valor!: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(256)
    estado!: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(1024)
    informacoesComplementares?: string | null | undefined;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsDecimal()
    latitude!: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsDecimal()
    longitude!: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    publicado!: boolean;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsInt()
    idQuadra!: bigint;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsInt()
    idLogradouro!: bigint;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsInt()
    idAnexo!: bigint;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    createdAt?: Date | null | undefined;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    updatedAt?: Date | null | undefined; 

}