CREATE TABLE "logradouro" (
	"id_logradouro" bigserial PRIMARY KEY NOT NULL,
	"nome" varchar(256) NOT NULL,
	"id_cidade" bigint NOT NULL
);
