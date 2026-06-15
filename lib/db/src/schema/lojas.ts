import { pgTable, text, serial, boolean, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriasTable } from "./categorias";

export const lojasTable = pgTable("rs_lojas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  endereco: text("endereco").notNull(),
  whatsapp: text("whatsapp"),
  regrasAtacado: text("regras_atacado"),
  emDestaque: boolean("em_destaque").notNull().default(false),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  categoriaId: integer("categoria_id").notNull().references(() => categoriasTable.id),
});

export const insertLojaSchema = createInsertSchema(lojasTable).omit({ id: true });
export type InsertLoja = z.infer<typeof insertLojaSchema>;
export type Loja = typeof lojasTable.$inferSelect;
