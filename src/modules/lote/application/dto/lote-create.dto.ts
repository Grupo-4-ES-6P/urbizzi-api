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
    areaQuadrada!: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
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
    latitude!: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
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

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @IsInt()
    idAnexo?: bigint | null;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    createdAt?: Date | null | undefined;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    updatedAt?: Date | null | undefined; 

}