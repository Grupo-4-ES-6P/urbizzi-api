CREATE TABLE "proposta" (
	"id_proposta" serial PRIMARY KEY NOT NULL,
	"valor" numeric NOT NULL,
	"condicoes" text NOT NULL,
	"observacoes" text,
	"versao" integer DEFAULT 1 NOT NULL,
	"status" text NOT NULL,
	"justificativa" text,
	"prazo_resposta" timestamp with time zone,
	"data_criacao" timestamp with time zone DEFAULT now() NOT NULL,
	"data_venda" timestamp with time zone,
	"data_cancelamento" timestamp with time zone,
	"id_lote" integer NOT NULL,
	"id_usuario" integer NOT NULL,
	"id_cliente" integer NOT NULL
);
