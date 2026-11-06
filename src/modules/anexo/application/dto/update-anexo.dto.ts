import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateAnexoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tipoArquivo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  caminhoArquivo?: string;
}
