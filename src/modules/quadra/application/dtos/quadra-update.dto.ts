import { ApiProperty } from "@nestjs/swagger";
import {
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";

export class UpdateQuadraDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(256)
    identificacao?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    idLoteamento?: bigint;
}