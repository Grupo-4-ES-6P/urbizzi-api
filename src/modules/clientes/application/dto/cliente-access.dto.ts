import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClienteAccessDto {
  @IsEmail()
  @MaxLength(256)
  emailAcesso!: string;
}

export class ActivateClienteAccessDto {
  @IsString()
  @MinLength(32)
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  senha!: string;
}
