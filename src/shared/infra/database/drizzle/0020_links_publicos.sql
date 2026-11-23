CREATE TABLE "link_publico" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"token" varchar(32) NOT NULL,
	"escopo" varchar(20) NOT NULL,
	"alvo" varchar(64),
	"expira_em" timestamp with time zone,
	"visitas" integer DEFAULT 0 NOT NULL,
	"id_usuario" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "link_publico_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "link_publico" ADD CONSTRAINT "link_publico_id_usuario_usuarios_id_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;