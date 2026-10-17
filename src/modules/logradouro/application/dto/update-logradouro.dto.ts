import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class UpdateLogradouroDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  nome?: string;

  @IsOptional()
  @Matches(/^\d+$/, {
    message: "idCidade deve ser um inteiro positivo.",
  })
  idCidade?: string;
}
