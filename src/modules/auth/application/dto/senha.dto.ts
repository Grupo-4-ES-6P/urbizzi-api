import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class TrocarSenhaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  senhaAtual!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  novaSenha!: string;
}

export class RecuperarSenhaDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(256)
  email!: string;
}

export class RedefinirSenhaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  novaSenha!: string;
}
