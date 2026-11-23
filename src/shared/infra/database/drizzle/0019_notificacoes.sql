CREATE TABLE "notificacao" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"id_usuario" bigint NOT NULL,
	"tipo" varchar(40) NOT NULL,
	"titulo" varchar(120) NOT NULL,
	"mensagem" text NOT NULL,
	"link" varchar(255),
	"chave" varchar(120) NOT NULL,
	"lida_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_id_usuario_usuarios_id_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "notificacao_usuario_chave" ON "notificacao" USING btree ("id_usuario","chave");--> statement-breakpoint
CREATE INDEX "notificacao_usuario_data" ON "notificacao" USING btree ("id_usuario","created_at");