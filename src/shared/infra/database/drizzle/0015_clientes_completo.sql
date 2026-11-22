CREATE TABLE "cliente_contato" (
	"id_contato" bigserial PRIMARY KEY NOT NULL,
	"id_cliente" bigint NOT NULL,
	"data" date NOT NULL,
	"canal" varchar(40) NOT NULL,
	"responsavel" varchar(256) NOT NULL,
	"imovel_id" varchar(64),
	"assunto" text NOT NULL,
	"resultado" varchar(20) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cliente" ALTER COLUMN "telefone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "celular" varchar(13);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "rg" varchar(20);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "data_nascimento" date;--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "estado_civil" varchar(30);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "profissao" varchar(120);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "responsavel" varchar(256);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "imovel_interesse_id" varchar(64);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "endereco_cep" varchar(8);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "endereco_logradouro" varchar(256);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "endereco_numero" varchar(20);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "endereco_complemento" varchar(120);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "endereco_bairro" varchar(120);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "endereco_cidade" varchar(120);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "endereco_uf" varchar(2);--> statement-breakpoint
ALTER TABLE "cliente" ADD COLUMN "endereco_pais" varchar(60);--> statement-breakpoint
ALTER TABLE "cliente_contato" ADD CONSTRAINT "cliente_contato_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE cascade ON UPDATE no action;