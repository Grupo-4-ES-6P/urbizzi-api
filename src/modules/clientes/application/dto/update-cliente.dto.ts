import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { TipoDocumentoCliente } from "../../domain/models/cliente.entity";

export class UpdateClienteDto {
  @IsOptional()
  @IsEnum(TipoDocumentoCliente)
  tipoDocumento?: TipoDocumentoCliente;

  @IsOptional()
  @IsString()
  @MaxLength(18)
  documentoIdentificacao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  razaoSocial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  nomeFantasia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(256)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  origem?: string;
}
