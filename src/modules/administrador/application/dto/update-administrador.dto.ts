import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class UpdateAdministradorDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  nome?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(256)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cnpj?: string;

  @IsOptional()
  @Matches(/^\d+$/, {
    message: "idEndereco deve ser um inteiro positivo.",
  })
  idEndereco?: string;
}
