import { pgTable, serial, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { lojasTable } from "./lojas";

export const favoritosTable = pgTable("rs_favoritos", {
  id: serial("id").primaryKey(),
  lojaId: integer("loja_id").notNull().references(() => lojasTable.id),
}, (t) => [unique().on(t.lojaId)]);

export const insertFavoritoSchema = createInsertSchema(favoritosTable).omit({ id: true });
export type InsertFavorito = z.infer<typeof insertFavoritoSchema>;
export type Favorito = typeof favoritosTable.$inferSelect;
