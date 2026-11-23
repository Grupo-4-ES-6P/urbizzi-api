import { Perfil } from "@modules/permissoes/domain/permissoes.catalogo";
import { StatusUsuario } from "@modules/usuarios/domain/models/usuario.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsEnum,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUsuarioDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  @MaxLength(256)
  email?: string;
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password?: string;

  @ApiProperty({enum: StatusUsuario, enumName: "balls"})
  @IsOptional()
  @IsEnum(StatusUsuario)
  @MaxLength(256)
  status?: StatusUsuario | string;

  @ApiProperty({ enum: Perfil, required: false })
  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    value === undefined || value === null ? undefined : BigInt(value),
  )
  anexoId?: bigint;

}

