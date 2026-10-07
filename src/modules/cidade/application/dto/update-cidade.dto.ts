import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCidadeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  nome?: string;
}
