ALTER TABLE "lote" ALTER COLUMN "area_quadrada" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "valor" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "latitude" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "longitude" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "id_quadra" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "id_logradouro" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lote" ADD COLUMN "detalhes" jsonb DEFAULT '{}'::jsonb NOT NULL;