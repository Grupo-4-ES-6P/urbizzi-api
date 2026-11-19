ALTER TABLE "usuarios" RENAME COLUMN "jogador_id" TO "anexo_id";--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "status" SET DEFAULT 'PENDENTE_ATIVACAO';--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_anexo_id_anexo_id_anexo_fk" FOREIGN KEY ("anexo_id") REFERENCES "public"."anexo"("id_anexo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" DROP COLUMN "administrador_id";