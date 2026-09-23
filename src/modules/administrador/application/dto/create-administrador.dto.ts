import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsInt,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAdministradorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  nome!: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(256)
  email!: string;
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cnpj!: string;

  @ApiProperty()
  @IsInt({
    message: "administradorId deve ser um inteiro positivo.",
  })
  idEndereco!: string;
}
