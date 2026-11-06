CREATE TABLE "anexo" (
	"id_anexo" serial PRIMARY KEY NOT NULL,
	"tipo_arquivo" text NOT NULL,
	"caminho_arquivo" text NOT NULL,
	"data_upload" timestamp with time zone DEFAULT now() NOT NULL
);
