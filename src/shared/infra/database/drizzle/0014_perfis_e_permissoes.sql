CREATE TYPE "public"."perfil_usuario" AS ENUM('ADMINISTRADOR', 'GERENTE_COMERCIAL', 'CORRETOR', 'COLETOR');--> statement-breakpoint
CREATE TABLE "perfil_permissao" (
	"perfil" "perfil_usuario" NOT NULL,
	"permissao" varchar(64) NOT NULL,
	CONSTRAINT "perfil_permissao_perfil_permissao_pk" PRIMARY KEY("perfil","permissao")
);
--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "perfil" "perfil_usuario" DEFAULT 'CORRETOR' NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "ultimo_acesso" timestamp with time zone;