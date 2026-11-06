import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const anexoSchema = pgTable("anexo", {
  idAnexo: serial("id_anexo").primaryKey(),
  tipoArquivo: text("tipo_arquivo").notNull(),
  caminhoArquivo: text("caminho_arquivo").notNull(),
  dataUpload: timestamp("data_upload", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
