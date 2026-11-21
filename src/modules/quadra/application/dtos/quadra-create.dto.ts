import { ApiProperty } from "@nestjs/swagger";
import {
    IsNumber,
    IsNotEmpty,
    IsString,
    MaxLength,
} from "class-validator";

export class CreateQuadraDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    identificacao!: string;

    @ApiProperty()
    @IsNumber()
    idLoteamento!: bigint;
}