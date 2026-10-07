DROP TABLE "cliente_access_token";--> statement-breakpoint
ALTER TABLE "cliente" DROP CONSTRAINT "cliente_id_usuario_usuarios_id_fk";
--> statement-breakpoint
DROP INDEX "cliente_usuario_unique";--> statement-breakpoint
ALTER TABLE "cliente" DROP COLUMN "id_usuario";
