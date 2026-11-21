CREATE TABLE "quadras" (
	"id_quadra" bigserial PRIMARY KEY NOT NULL,
	"identificacao" varchar NOT NULL,
	"id_loteamento" bigserial NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "quadras_id_quadra_unique" UNIQUE("id_quadra")
);
--> statement-breakpoint
ALTER TABLE "quadras" ADD CONSTRAINT "quadras_id_loteamento_loteamento_id_loteamento_fk" FOREIGN KEY ("id_loteamento") REFERENCES "public"."loteamento"("id_loteamento") ON DELETE no action ON UPDATE no action;