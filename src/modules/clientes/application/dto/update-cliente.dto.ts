import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { TipoDocumentoCliente } from "../../domain/models/cliente.entity";
import { ClienteComplementoDto } from "./cliente-complemento.dto";

const vazioParaNull = ({ value }: { value: unknown }) =>
  value === "" ? null : value;

export class UpdateClienteDto extends ClienteComplementoDto {
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
  @Transform(vazioParaNull)
  @IsString()
  @MaxLength(20)
  telefone?: string | null;

  @IsOptional()
  @Transform(vazioParaNull)
  @IsEmail()
  @MaxLength(256)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  origem?: string;
}
