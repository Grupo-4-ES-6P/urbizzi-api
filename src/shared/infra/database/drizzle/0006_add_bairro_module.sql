CREATE TABLE "bairro" (
	"id_bairro" bigserial PRIMARY KEY NOT NULL,
	"nome" varchar(256) NOT NULL,
	"id_cidade" bigint NOT NULL
);
