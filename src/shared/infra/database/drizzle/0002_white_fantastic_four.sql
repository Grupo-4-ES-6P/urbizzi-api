CREATE TABLE "loteamento" (
	"id_loteamento" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"descricao" text NOT NULL,
	"situacao" text NOT NULL,
	"publicado" boolean NOT NULL,
	"id_bairro" integer NOT NULL
);
