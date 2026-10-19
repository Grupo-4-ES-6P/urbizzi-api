import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateAnexoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tipoArquivo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  caminhoArquivo!: string;
}
