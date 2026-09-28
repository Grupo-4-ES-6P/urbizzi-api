import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { TipoDocumentoCliente } from "../../domain/models/cliente.entity";

export class CreateClienteDto {
  @IsEnum(TipoDocumentoCliente)
  tipoDocumento!: TipoDocumentoCliente;

  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  documentoIdentificacao!: string;

  @ValidateIf(
    (dto: CreateClienteDto) => dto.tipoDocumento === TipoDocumentoCliente.CPF,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  nome?: string;

  @ValidateIf(
    (dto: CreateClienteDto) => dto.tipoDocumento === TipoDocumentoCliente.CNPJ,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  razaoSocial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  nomeFantasia?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefone!: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsEmail()
  @MaxLength(256)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  origem?: string;

  @IsOptional()
  @IsBoolean()
  criarAcesso = false;

  @IsOptional()
  @IsEmail()
  @MaxLength(256)
  emailAcesso?: string;
}
