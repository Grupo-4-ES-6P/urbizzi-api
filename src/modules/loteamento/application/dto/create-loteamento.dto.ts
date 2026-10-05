import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateLoteamentoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsString()
  @IsNotEmpty()
  situacao!: string;

  @IsBoolean()
  publicado!: boolean;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  idBairro!: number;
}
