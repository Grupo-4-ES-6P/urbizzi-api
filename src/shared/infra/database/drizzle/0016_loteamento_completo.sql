ALTER TABLE "loteamento" ALTER COLUMN "descricao" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "loteamento" ALTER COLUMN "id_bairro" DROP NOT NULL;--> statement-breakpoint
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
ALTER TABLE "loteamento" ADD COLUMN "validade_licenca" date;