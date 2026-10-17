import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import {
  StatusCliente,
  TipoDocumentoCliente,
} from "../../domain/models/cliente.entity";

export class FindClientesQueryDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  documentoIdentificacao?: string;

  @IsOptional()
  @IsEnum(TipoDocumentoCliente)
  tipoDocumento?: TipoDocumentoCliente;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  origem?: string;

  @IsOptional()
  @IsEnum(StatusCliente)
  status?: StatusCliente;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage = 10;
}
