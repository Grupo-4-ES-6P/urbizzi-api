import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { bigint, bigserial, index, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const notificacaoSchema = pgTable(
  "notificacao",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    idUsuario: bigint("id_usuario", { mode: "bigint" })
      .notNull()
      .references(() => usuariosSchema.id, { onDelete: "cascade" }),
    tipo: varchar("tipo", { length: 40 }).notNull(),
    titulo: varchar("titulo", { length: 120 }).notNull(),
    mensagem: text("mensagem").notNull(),
    link: varchar("link", { length: 255 }),
    // Mesmo evento não duplica para a mesma pessoa
    chave: varchar("chave", { length: 120 }).notNull(),
    lidaEm: timestamp("lida_em", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("notificacao_usuario_chave").on(t.idUsuario, t.chave),
    index("notificacao_usuario_data").on(t.idUsuario, t.createdAt),
  ],
);
