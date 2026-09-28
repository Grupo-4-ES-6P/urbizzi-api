import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateUsuarioDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(256)
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  password!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt({
    message: "jogadorId deve ser um inteiro positivo.",
  })
  jogadorId?: bigint | undefined;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt({
    message: "administradorId deve ser um inteiro positivo.",
  })
  administradorId?: bigint | undefined;

  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  permissions!: string[];
}
