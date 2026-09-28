CREATE TYPE "public"."status_cliente" AS ENUM('ATIVO', 'INATIVO');--> statement-breakpoint
CREATE TYPE "public"."tipo_documento_cliente" AS ENUM('CPF', 'CNPJ');--> statement-breakpoint
CREATE TABLE "cliente" (
	"id_cliente" bigserial PRIMARY KEY NOT NULL,
	"tipo_documento" "tipo_documento_cliente" NOT NULL,
	"documento_identificacao" varchar(14) NOT NULL,
	"nome" varchar(256),
	"razao_social" varchar(256),
	"nome_fantasia" varchar(256),
	"telefone" varchar(13) NOT NULL,
	"email" varchar(256),
	"origem" varchar(256),
	"status" "status_cliente" DEFAULT 'ATIVO' NOT NULL,
	"id_usuario" bigint,
	"data_cadastro" timestamp with time zone DEFAULT now() NOT NULL,
	"data_atualizacao" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_id_usuario_usuarios_id_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cliente_documento_unique" ON "cliente" USING btree ("documento_identificacao");--> statement-breakpoint
CREATE UNIQUE INDEX "cliente_usuario_unique" ON "cliente" USING btree ("id_usuario");