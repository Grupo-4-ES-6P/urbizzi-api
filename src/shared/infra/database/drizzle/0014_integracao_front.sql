CREATE TYPE "public"."perfil_usuario" AS ENUM('ADMINISTRADOR', 'GERENTE_COMERCIAL', 'CORRETOR', 'COLETOR');--> statement-breakpoint
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
CREATE TABLE "perfil_permissao" (
	"perfil" "perfil_usuario" NOT NULL,
	"permissao" varchar(64) NOT NULL,
	CONSTRAINT "perfil_permissao_perfil_permissao_pk" PRIMARY KEY("perfil","permissao")
);
--> statement-breakpoint
ALTER TABLE "cliente" ALTER COLUMN "telefone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "id_quadra" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "id_logradouro" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "id_anexo" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "loteamento" ALTER COLUMN "descricao" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "loteamento" ALTER COLUMN "id_bairro" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quadras" ALTER COLUMN "id_loteamento" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "anexo_id" SET DATA TYPE bigint;--> statement-breakpoint
-- bigserial deixou DEFAULT/NOT NULL nas FKs
ALTER TABLE "usuarios" ALTER COLUMN "anexo_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "anexo_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quadras" ALTER COLUMN "id_loteamento" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "id_quadra" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "id_logradouro" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "id_anexo" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lote" ALTER COLUMN "id_anexo" DROP NOT NULL;--> statement-breakpoint
DROP SEQUENCE IF EXISTS "usuarios_jogador_id_seq";--> statement-breakpoint
DROP SEQUENCE IF EXISTS "quadras_id_loteamento_seq";--> statement-breakpoint
DROP SEQUENCE IF EXISTS "lote_id_quadra_seq";--> statement-breakpoint
DROP SEQUENCE IF EXISTS "lote_id_logradouro_seq";--> statement-breakpoint
DROP SEQUENCE IF EXISTS "lote_id_anexo_seq";--> statement-breakpoint
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
ALTER TABLE "loteamento" ADD COLUMN "codigo" varchar(20);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "data_aprovacao" date;--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "cep" varchar(8);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "endereco" varchar(256);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "bairro" varchar(120);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "cidade" varchar(120);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "uf" varchar(2);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "matricula_mae" varchar(60);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "area_total" double precision;--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "area_loteavel" double precision;--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "cartorio" varchar(160);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "numero_registro" varchar(60);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "licenca_ambiental" varchar(60);--> statement-breakpoint
ALTER TABLE "loteamento" ADD COLUMN "validade_licenca" date;--> statement-breakpoint
ALTER TABLE "quadras" ADD COLUMN "area" double precision;--> statement-breakpoint
ALTER TABLE "quadras" ADD COLUMN "testada_para" varchar(120);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "perfil" "perfil_usuario" DEFAULT 'CORRETOR' NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "ultimo_acesso" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cliente_contato" ADD CONSTRAINT "cliente_contato_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quadras_loteamento_identificacao_unique" ON "quadras" USING btree ("id_loteamento","identificacao");