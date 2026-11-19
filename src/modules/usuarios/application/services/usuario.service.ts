import { CreateUsuarioDto } from "../dto/usuario-create.dto";
import { UpdateUsuarioDto } from "@modules/usuarios/application/dto/usuario-update.dto";
import type { UsuarioResponseDto } from "../dto/usuario-response.dto";
import { StatusUsuario, Usuario } from "@modules/usuarios/domain/models/usuario.entity";
import {
  USUARIO_REPOSITORY,
  type UsuarioRepository,
} from "@modules/usuarios/domain/repositories/usuario-repository.interface";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { UsuarioBuilder } from "@modules/usuarios/domain/builder/usuario.builder";

export interface UsuarioPayload {
  id: bigint;
  email: string;
  permissions: string[];
}

@Injectable()
export class UsuarioService {

  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly userRepository: UsuarioRepository,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    const existing = await this.userRepository.findByEmail(
      dto.email.toLowerCase(),
    );
    if (existing) throw new ConflictException("Email already registered");

    // hash da senha ANTES de persistir
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new UsuarioBuilder()
      .withName(dto.name)
      .withEmail(dto.email)
      .withPassword(hashedPassword)
      .withStatus(dto.status)
      .withPermissions(this.normalizePermissions(dto.permissions))
      .withAnexoId(dto.anexoId)
      .build()

    await this.userRepository.create(user);

    const saved = await this.userRepository.findByEmail(
      dto.email.toLowerCase(),
    );

    if (!saved) {
      throw new NotFoundException(
        "Não foi possível recuperar o usuário criado.",
      );
    }

    return this.toResponse(saved);
  }

  async findAll(): Promise<UsuarioResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.toResponse(user));
  }

  async findById(id: string): Promise<UsuarioResponseDto> {
    const user = await this.userRepository.findById(this.parseBigInt(id, "id"));

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    const parsedId = this.parseBigInt(id, "id");
    const current = await this.userRepository.findById(parsedId);

    if (!current) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    const email = dto.email ? dto.email.toLowerCase() : current.email;

    if (dto.email) {
      const existing = await this.userRepository.findByEmail(email);

      if (existing && existing.id !== parsedId) {
        throw new ConflictException("Email already registered");
      }
    }

    const password = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : current.password;

    const updatedUser = new UsuarioBuilder()
      .withName(dto.name??"")
      .withEmail(dto.email??"")
      .withPassword(password)
      .withStatus(dto.status??StatusUsuario.INATIVO)
      .withPermissions(
        dto.permissions !== undefined 
        ? this.normalizePermissions(dto.permissions) 
        : current.permissions)
      .withAnexoId(
        dto.anexoId !== undefined 
        ? dto.anexoId 
        : current.anexoId)
      .build()

    if (!updatedUser) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    await this.userRepository.update(updatedUser);

    const refreshed = await this.userRepository.findById(parsedId);

    if (!refreshed) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    return this.toResponse(refreshed);
  }

  async delete(id: string): Promise<void> {
    const parsedId = this.parseBigInt(id, "id");
    const current = await this.userRepository.findById(parsedId);

    if (!current) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    await this.userRepository.delete(parsedId);
  }

  // common

  private toResponse(user: Usuario): UsuarioResponseDto {
    return {
      id: user.id.toString(),
      name: user.name.toString(),
      email: user.email,
      status: user.status,
      permissions: user.permissions,
      anexoId: user.anexoId.toString(),
    };
  }

  // chamado pelo AuthService durante o login
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UsuarioPayload | null> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    // retorna apenas o que entra no JWT — sem a senha
    return { id: user.id!, email: user.email, permissions: user.permissions };
  }

  private normalizePermissions(permissions: string[]): string[] {
    return permissions
      .map((permission) => permission.trim().toUpperCase())
      .filter(Boolean);
  }

  private parseBigInt(value: string, fieldName: string): bigint {
    const normalizedValue = value.trim();

    if (!/^\d+$/.test(normalizedValue)) {
      throw new BadRequestException(`${fieldName} inválido.`);
    }

    return BigInt(normalizedValue);
  }

}
