import { Router, type IRouter } from "express";
import { db, categoriasTable, lojasTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import { ListCategoriasResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categorias", async (req, res): Promise<void> => {
  const categorias = await db
    .select({
      id: categoriasTable.id,
      nome: categoriasTable.nome,
      icone: categoriasTable.icone,
      totalLojas: sql<number>`count(${lojasTable.id})::int`,
    })
    .from(categoriasTable)
    .leftJoin(lojasTable, eq(lojasTable.categoriaId, categoriasTable.id))
    .groupBy(categoriasTable.id)
    .orderBy(categoriasTable.nome);

  res.json(ListCategoriasResponse.parse(categorias));
});

export default router;
