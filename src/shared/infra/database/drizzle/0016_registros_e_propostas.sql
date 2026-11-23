CREATE TABLE "documento_imovel" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"codigo" varchar(40),
	"id_lote" bigint,
	"id_cliente" bigint,
	"status" varchar(40),
	"data" timestamp with time zone,
	"valor" double precision,
	"detalhes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historico_imovel" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"codigo" varchar(40),
	"id_lote" bigint,
	"id_cliente" bigint,
	"status" varchar(40),
	"data" timestamp with time zone,
	"valor" double precision,
	"detalhes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interesse" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"codigo" varchar(40),
	"id_lote" bigint,
	"id_cliente" bigint,
	"status" varchar(40),
	"data" timestamp with time zone,
	"valor" double precision,
	"detalhes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reserva" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"codigo" varchar(40),
	"id_lote" bigint,
	"id_cliente" bigint,
	"status" varchar(40),
	"data" timestamp with time zone,
	"valor" double precision,
	"detalhes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venda" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"codigo" varchar(40),
	"id_lote" bigint,
	"id_cliente" bigint,
	"status" varchar(40),
	"data" timestamp with time zone,
	"valor" double precision,
	"detalhes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "proposta" ADD COLUMN "codigo" varchar(40);--> statement-breakpoint
ALTER TABLE "proposta" ADD COLUMN "detalhes" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "documento_imovel" ADD CONSTRAINT "documento_imovel_id_lote_lote_id_lote_fk" FOREIGN KEY ("id_lote") REFERENCES "public"."lote"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento_imovel" ADD CONSTRAINT "documento_imovel_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historico_imovel" ADD CONSTRAINT "historico_imovel_id_lote_lote_id_lote_fk" FOREIGN KEY ("id_lote") REFERENCES "public"."lote"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historico_imovel" ADD CONSTRAINT "historico_imovel_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interesse" ADD CONSTRAINT "interesse_id_lote_lote_id_lote_fk" FOREIGN KEY ("id_lote") REFERENCES "public"."lote"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interesse" ADD CONSTRAINT "interesse_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_lote_lote_id_lote_fk" FOREIGN KEY ("id_lote") REFERENCES "public"."lote"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venda" ADD CONSTRAINT "venda_id_lote_lote_id_lote_fk" FOREIGN KEY ("id_lote") REFERENCES "public"."lote"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venda" ADD CONSTRAINT "venda_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE no action ON UPDATE no action;