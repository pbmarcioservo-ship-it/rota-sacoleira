import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriasTable = pgTable("rs_categorias", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  icone: text("icone").notNull(),
});

export const insertCategoriaSchema = createInsertSchema(categoriasTable).omit({ id: true });
export type InsertCategoria = z.infer<typeof insertCategoriaSchema>;
export type Categoria = typeof categoriasTable.$inferSelect;
