import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

export class CreateBairroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  nome!: string;

  @Matches(/^\d+$/, {
    message: "idCidade deve ser um inteiro positivo.",
  })
  idCidade!: string;
}
