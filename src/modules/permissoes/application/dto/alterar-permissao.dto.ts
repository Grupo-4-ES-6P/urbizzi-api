import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Perfil } from "../../domain/permissoes.catalogo";

export class AlterarPermissaoDto {
  @ApiProperty({ example: "CRIAR_PROPOSTA" })
  @IsString()
  @IsNotEmpty()
  permissao!: string;

  @ApiProperty({ enum: Perfil })
  @IsEnum(Perfil)
  perfil!: Perfil;

  @ApiProperty()
  @IsBoolean()
  liberado!: boolean;
}
