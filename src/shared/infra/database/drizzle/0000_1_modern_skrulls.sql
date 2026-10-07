CREATE TABLE "administrador" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"nome" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"cnpj" varchar(20) NOT NULL,
	"id_endereco" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"jogador_id" bigserial,
	"administrador_id" bigserial,
	"permissions" text[] NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "usuarios_id_unique" UNIQUE("id"),
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "administrador_email_unique" ON "administrador" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "administrador_cnpj_unique" ON "administrador" USING btree ("cnpj");