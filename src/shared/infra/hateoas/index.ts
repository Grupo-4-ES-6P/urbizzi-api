import { applyDecorators } from "@nestjs/common";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface LinkConfig {
  href: string;
  method?: string;
}

interface HateoasDecoratorOptions<T> {
  basePath: string;
  itemLinks?: (item: T) => Record<string, LinkConfig>;
}

export function HateoasItem<T>(_options: HateoasDecoratorOptions<T>) {
  return applyDecorators();
}

export function HateoasList<T>(_options: HateoasDecoratorOptions<T>) {
  return applyDecorators();
}
