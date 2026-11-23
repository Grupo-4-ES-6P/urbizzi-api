import { Perfil } from "@modules/permissoes/domain/permissoes.catalogo";
import { StatusUsuario } from "@modules/usuarios/domain/models/usuario.entity";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsNumber,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUsuarioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  name!: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(256)
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(256)
  password!: string;

  @ApiProperty({enum: StatusUsuario})
  @IsEnum(StatusUsuario)
  @IsNotEmpty()
  @MaxLength(256)
  status!: string;

  @ApiProperty({ enum: Perfil, required: false, default: Perfil.CORRETOR })
  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;

  @ApiProperty({ isArray: true, type: String, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  anexoId?: bigint | undefined;
  
}
