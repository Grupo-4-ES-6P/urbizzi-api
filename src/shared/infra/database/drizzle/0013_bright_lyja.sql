CREATE TABLE "lote" (
	"id_lote" bigserial PRIMARY KEY NOT NULL,
	"matricula" text,
	"tipo" varchar NOT NULL,
	"area_quadrada" double precision NOT NULL,
	"valor" double precision NOT NULL,
	"estado" varchar NOT NULL,
	"informacoes_complementares" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"publicado" boolean NOT NULL,
	"id_quadra" bigserial NOT NULL,
	"id_logradouro" bigserial NOT NULL,
	"id_anexo" bigserial,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "lote_id_lote_unique" UNIQUE("id_lote"),
	CONSTRAINT "lote_matricula_unique" UNIQUE("matricula")
);
--> statement-breakpoint
ALTER TABLE "lote" ADD CONSTRAINT "lote_id_quadra_quadras_id_quadra_fk" FOREIGN KEY ("id_quadra") REFERENCES "public"."quadras"("id_quadra") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lote" ADD CONSTRAINT "lote_id_logradouro_logradouro_id_logradouro_fk" FOREIGN KEY ("id_logradouro") REFERENCES "public"."logradouro"("id_logradouro") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lote" ADD CONSTRAINT "lote_id_anexo_anexo_id_anexo_fk" FOREIGN KEY ("id_anexo") REFERENCES "public"."anexo"("id_anexo") ON DELETE no action ON UPDATE no action;