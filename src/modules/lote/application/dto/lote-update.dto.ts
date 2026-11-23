import { PartialType } from "@nestjs/swagger";
import { CreateLoteDto } from "./lote-create.dto";

export class UpdateLoteDto extends PartialType(CreateLoteDto) {}
