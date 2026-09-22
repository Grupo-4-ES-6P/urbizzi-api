import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateUsuarioDto {
  @IsEmail()
  @MaxLength(256)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password!: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null ? undefined : String(value),
  )
  @Matches(/^\d+$/, {
    message: "jogadorId deve ser um inteiro positivo.",
  })
  jogadorId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null ? undefined : String(value),
  )
  @Matches(/^\d+$/, {
    message: "administradorId deve ser um inteiro positivo.",
  })
  administradorId?: string;

  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}

export class UpdateUsuarioDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(256)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null ? undefined : String(value),
  )
  @Matches(/^\d+$/, {
    message: "jogadorId deve ser um inteiro positivo.",
  })
  jogadorId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null ? undefined : String(value),
  )
  @Matches(/^\d+$/, {
    message: "administradorId deve ser um inteiro positivo.",
  })
  administradorId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UsuarioResponseDto {
  id!: string;
  email!: string;
  permissions!: string[];
  jogadorId!: string | null;
  administradorId!: string | null;
}
