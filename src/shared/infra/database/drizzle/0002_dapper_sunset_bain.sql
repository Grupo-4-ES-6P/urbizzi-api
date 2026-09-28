CREATE TYPE "public"."status_usuario" AS ENUM('PENDENTE_ATIVACAO', 'ATIVO', 'INATIVO');--> statement-breakpoint
CREATE TABLE "cliente_access_token" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"id_usuario" bigint NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "status" "status_usuario" DEFAULT 'ATIVO' NOT NULL;--> statement-breakpoint
ALTER TABLE "cliente_access_token" ADD CONSTRAINT "cliente_access_token_id_usuario_usuarios_id_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cliente_access_token_usuario_unique" ON "cliente_access_token" USING btree ("id_usuario");--> statement-breakpoint
CREATE UNIQUE INDEX "cliente_access_token_hash_unique" ON "cliente_access_token" USING btree ("token_hash");