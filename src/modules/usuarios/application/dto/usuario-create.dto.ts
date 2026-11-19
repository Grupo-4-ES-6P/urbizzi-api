import { StatusUsuario } from "@modules/usuarios/domain/models/usuario.entity";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsNumber,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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
  @MaxLength(256)
  password!: string;

  @ApiProperty({enum: StatusUsuario})
  @IsEnum(StatusUsuario)
  @IsNotEmpty()
  @MaxLength(256)
  status!: string;

  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  permissions!: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  anexoId?: bigint | undefined;
  
}
