import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCidadeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  nome!: string;
}
