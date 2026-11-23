-- Referência opcional quebrada vira nula
UPDATE "loteamento" SET "id_bairro" = NULL WHERE "id_bairro" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "bairro" b WHERE b."id_bairro" = "loteamento"."id_bairro");--> statement-breakpoint
-- NOT VALID: barra dado novo sem rejeitar o legado
ALTER TABLE "bairro" ADD CONSTRAINT "bairro_id_cidade_cidade_id_cidade_fk" FOREIGN KEY ("id_cidade") REFERENCES "public"."cidade"("id_cidade") ON DELETE no action ON UPDATE no action NOT VALID;--> statement-breakpoint
ALTER TABLE "logradouro" ADD CONSTRAINT "logradouro_id_cidade_cidade_id_cidade_fk" FOREIGN KEY ("id_cidade") REFERENCES "public"."cidade"("id_cidade") ON DELETE no action ON UPDATE no action NOT VALID;--> statement-breakpoint
ALTER TABLE "loteamento" ADD CONSTRAINT "loteamento_id_bairro_bairro_id_bairro_fk" FOREIGN KEY ("id_bairro") REFERENCES "public"."bairro"("id_bairro") ON DELETE no action ON UPDATE no action NOT VALID;--> statement-breakpoint
ALTER TABLE "proposta" ADD CONSTRAINT "proposta_id_lote_lote_id_lote_fk" FOREIGN KEY ("id_lote") REFERENCES "public"."lote"("id_lote") ON DELETE no action ON UPDATE no action NOT VALID;--> statement-breakpoint
ALTER TABLE "proposta" ADD CONSTRAINT "proposta_id_usuario_usuarios_id_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action NOT VALID;--> statement-breakpoint
ALTER TABLE "proposta" ADD CONSTRAINT "proposta_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE no action ON UPDATE no action NOT VALID;