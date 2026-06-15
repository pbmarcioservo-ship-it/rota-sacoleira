import { Router, type IRouter } from "express";
import { db, lojasTable, categoriasTable } from "@workspace/db";
import { eq, ilike, and, type SQL } from "drizzle-orm";
import {
  ListLojasQueryParams,
  ListLojasResponse,
  GetLojaParams,
  GetLojaResponse,
  CreateLojaBody,
  GetDestaqueSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const lojasWithCategoriaQuery = () =>
  db
    .select({
      id: lojasTable.id,
      nome: lojasTable.nome,
      endereco: lojasTable.endereco,
      whatsapp: lojasTable.whatsapp,
      regrasAtacado: lojasTable.regrasAtacado,
      emDestaque: lojasTable.emDestaque,
      latitude: lojasTable.latitude,
      longitude: lojasTable.longitude,
      categoriaId: lojasTable.categoriaId,
      categoriaNome: categoriasTable.nome,
      categoriaIcone: categoriasTable.icone,
    })
    .from(lojasTable)
    .innerJoin(categoriasTable, eq(lojasTable.categoriaId, categoriasTable.id));

router.get("/lojas/destaque/summary", async (req, res): Promise<void> => {
  const [totalRow] = await db.select({ count: db.$count(lojasTable) }).from(lojasTable);
  const [destaqueRow] = await db
    .select({ count: db.$count(lojasTable) })
    .from(lojasTable)
    .where(eq(lojasTable.emDestaque, true));

  const porCategoria = await db
    .select({
      categoriaId: lojasTable.categoriaId,
      categoriaNome: categoriasTable.nome,
      total: db.$count(lojasTable),
    })
    .from(lojasTable)
    .innerJoin(categoriasTable, eq(lojasTable.categoriaId, categoriasTable.id))
    .groupBy(lojasTable.categoriaId, categoriasTable.nome)
    .orderBy(categoriasTable.nome);

  res.json(
    GetDestaqueSummaryResponse.parse({
      totalLojas: totalRow?.count ?? 0,
      totalDestaques: destaqueRow?.count ?? 0,
      porCategoria,
    }),
  );
});

router.get("/lojas", async (req, res): Promise<void> => {
  const parsed = ListLojasQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { categoriaId, search, emDestaque } = parsed.data;

  const conditions: SQL[] = [];
  if (categoriaId != null) conditions.push(eq(lojasTable.categoriaId, categoriaId));
  if (search != null && search.trim() !== "") {
    conditions.push(ilike(lojasTable.nome, `%${search}%`));
  }
  if (emDestaque != null) conditions.push(eq(lojasTable.emDestaque, emDestaque));

  const lojas = await lojasWithCategoriaQuery()
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(lojasTable.nome);

  res.json(ListLojasResponse.parse(lojas));
});

router.post("/lojas", async (req, res): Promise<void> => {
  const parsed = CreateLojaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [loja] = await db.insert(lojasTable).values(parsed.data).returning();
  const result = await lojasWithCategoriaQuery()
    .where(eq(lojasTable.id, loja.id));

  res.status(201).json(GetLojaResponse.parse(result[0]));
});

router.get("/lojas/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetLojaParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const result = await lojasWithCategoriaQuery()
    .where(eq(lojasTable.id, params.data.id));

  if (!result[0]) {
    res.status(404).json({ error: "Loja não encontrada" });
    return;
  }

  res.json(GetLojaResponse.parse(result[0]));
});

export default router;
