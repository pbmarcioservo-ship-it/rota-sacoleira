import { Router, type IRouter } from "express";
import { db, favoritosTable, lojasTable, categoriasTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  AddFavoritoBody,
  RemoveFavoritoParams,
  CheckFavoritoParams,
  CheckFavoritoResponse,
  ListFavoritosResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/favoritos", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      favId: favoritosTable.id,
      lojaId: lojasTable.id,
      lojaNome: lojasTable.nome,
      lojaEndereco: lojasTable.endereco,
      lojaWhatsapp: lojasTable.whatsapp,
      lojaRegrasAtacado: lojasTable.regrasAtacado,
      lojaEmDestaque: lojasTable.emDestaque,
      lojaLatitude: lojasTable.latitude,
      lojaLongitude: lojasTable.longitude,
      lojaCategoriaId: lojasTable.categoriaId,
      categoriaNome: categoriasTable.nome,
      categoriaIcone: categoriasTable.icone,
    })
    .from(favoritosTable)
    .innerJoin(lojasTable, eq(favoritosTable.lojaId, lojasTable.id))
    .innerJoin(categoriasTable, eq(lojasTable.categoriaId, categoriasTable.id))
    .orderBy(categoriasTable.nome, lojasTable.nome);

  const grouped = new Map<
    number,
    { categoriaId: number; categoriaNome: string; categoriaIcone: string; lojas: unknown[] }
  >();

  for (const row of rows) {
    if (!grouped.has(row.lojaCategoriaId)) {
      grouped.set(row.lojaCategoriaId, {
        categoriaId: row.lojaCategoriaId,
        categoriaNome: row.categoriaNome,
        categoriaIcone: row.categoriaIcone,
        lojas: [],
      });
    }
    grouped.get(row.lojaCategoriaId)!.lojas.push({
      id: row.lojaId,
      nome: row.lojaNome,
      endereco: row.lojaEndereco,
      whatsapp: row.lojaWhatsapp,
      regrasAtacado: row.lojaRegrasAtacado,
      emDestaque: row.lojaEmDestaque,
      latitude: row.lojaLatitude,
      longitude: row.lojaLongitude,
      categoriaId: row.lojaCategoriaId,
      categoriaNome: row.categoriaNome,
      categoriaIcone: row.categoriaIcone,
    });
  }

  res.json(ListFavoritosResponse.parse(Array.from(grouped.values())));
});

router.post("/favoritos", async (req, res): Promise<void> => {
  const parsed = AddFavoritoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(favoritosTable)
    .where(eq(favoritosTable.lojaId, parsed.data.lojaId));

  if (existing[0]) {
    const loja = await db
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
      .innerJoin(categoriasTable, eq(lojasTable.categoriaId, categoriasTable.id))
      .where(eq(lojasTable.id, parsed.data.lojaId));

    res.status(201).json({ id: existing[0].id, lojaId: existing[0].lojaId, loja: loja[0] });
    return;
  }

  const [fav] = await db
    .insert(favoritosTable)
    .values({ lojaId: parsed.data.lojaId })
    .returning();

  const loja = await db
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
    .innerJoin(categoriasTable, eq(lojasTable.categoriaId, categoriasTable.id))
    .where(eq(lojasTable.id, fav.lojaId));

  res.status(201).json({ id: fav.id, lojaId: fav.lojaId, loja: loja[0] });
});

router.get("/favoritos/check/:lojaId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.lojaId) ? req.params.lojaId[0] : req.params.lojaId;
  const params = CheckFavoritoParams.safeParse({ lojaId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(favoritosTable)
    .where(eq(favoritosTable.lojaId, params.data.lojaId));

  res.json(CheckFavoritoResponse.parse({ isFavorito: existing.length > 0 }));
});

router.delete("/favoritos/:lojaId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.lojaId) ? req.params.lojaId[0] : req.params.lojaId;
  const params = RemoveFavoritoParams.safeParse({ lojaId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(favoritosTable).where(eq(favoritosTable.lojaId, params.data.lojaId));
  res.sendStatus(204);
});

export default router;
