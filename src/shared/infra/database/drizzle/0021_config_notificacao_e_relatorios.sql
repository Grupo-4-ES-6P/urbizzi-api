CREATE TABLE "config_notificacao" (
	"tipo" varchar(40) PRIMARY KEY NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"email" boolean DEFAULT false NOT NULL,
	"antecedencia_horas" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relatorio_gerado" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"nome" varchar(80) NOT NULL,
	"periodo" varchar(40) NOT NULL,
	"formato" varchar(10) NOT NULL,
	"registros" integer DEFAULT 0 NOT NULL,
	"id_usuario" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "relatorio_gerado" ADD CONSTRAINT "relatorio_gerado_id_usuario_usuarios_id_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;