ALTER TABLE "usuarios" ALTER COLUMN "anexo_id" SET DATA TYPE bigint;--> statement-breakpoint
-- bigserial deixou DEFAULT e NOT NULL
ALTER TABLE "usuarios" ALTER COLUMN "anexo_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "anexo_id" DROP NOT NULL;--> statement-breakpoint
DROP SEQUENCE IF EXISTS "usuarios_jogador_id_seq";
