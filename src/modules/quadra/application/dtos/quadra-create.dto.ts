import { ApiProperty } from "@nestjs/swagger";
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class CreateQuadraDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    identificacao!: string;

    @ApiProperty()
    @IsInt()
    @Min(1)
    idLoteamento!: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    area?: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    testadaPara?: string | null;
}
