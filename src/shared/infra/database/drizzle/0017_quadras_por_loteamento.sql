ALTER TABLE "quadras" ALTER COLUMN "id_loteamento" SET DATA TYPE bigint;--> statement-breakpoint
-- bigserial deixou DEFAULT na FK
ALTER TABLE "quadras" ALTER COLUMN "id_loteamento" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE IF EXISTS "quadras_id_loteamento_seq";--> statement-breakpoint
ALTER TABLE "quadras" ADD COLUMN "area" double precision;--> statement-breakpoint
ALTER TABLE "quadras" ADD COLUMN "testada_para" varchar(120);--> statement-breakpoint
CREATE UNIQUE INDEX "quadras_loteamento_identificacao_unique" ON "quadras" USING btree ("id_loteamento","identificacao");