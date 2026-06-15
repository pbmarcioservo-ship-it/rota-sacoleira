import { Router, type IRouter } from "express";
import { db, lojasTable, favoritosTable, categoriasTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SP_LOCATION = "-23.5505,-46.6333";
const SP_RADIUS = 25000;

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  geometry?: {
    location: { lat: number; lng: number };
  };
  formatted_phone_number?: string;
  international_phone_number?: string;
}

async function fetchPlaces(query: string): Promise<GooglePlace[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return [];

  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", `${query} São Paulo SP`);
  url.searchParams.set("location", SP_LOCATION);
  url.searchParams.set("radius", String(SP_RADIUS));
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("key", key);

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    logger.warn({ status: resp.status }, "Google Places text search failed");
    return [];
  }
  const data = await resp.json() as { status: string; results?: GooglePlace[] };
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    logger.warn({ status: data.status }, "Google Places API error status");
    return [];
  }
  return data.results ?? [];
}

router.get("/places/search", async (req, res): Promise<void> => {
  const q = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  if (!q || typeof q !== "string" || q.trim().length < 2) {
    res.status(400).json({ error: "Parâmetro q obrigatório (mínimo 2 caracteres)" });
    return;
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    res.status(503).json({ error: "Google Maps API não configurada" });
    return;
  }

  const places = await fetchPlaces(q.trim());

  const results = places.slice(0, 10).map((p) => ({
    placeId: p.place_id,
    nome: p.name,
    endereco: p.formatted_address ?? p.vicinity ?? "",
    whatsapp: null,
    latitude: p.geometry?.location.lat ?? null,
    longitude: p.geometry?.location.lng ?? null,
  }));

  res.json(results);
});

router.post("/places/save", async (req, res): Promise<void> => {
  const { placeId, nome, endereco, whatsapp, latitude, longitude, categoriaId, favoritar } = req.body as {
    placeId: string;
    nome: string;
    endereco: string;
    whatsapp?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    categoriaId: number;
    favoritar?: boolean;
  };

  if (!placeId || !nome || !endereco || !categoriaId) {
    res.status(400).json({ error: "Campos obrigatórios: placeId, nome, endereco, categoriaId" });
    return;
  }

  const existing = await db
    .select({ id: lojasTable.id })
    .from(lojasTable)
    .where(eq(lojasTable.nome, nome));

  let lojaId: number;

  if (existing[0]) {
    lojaId = existing[0].id;
    req.log.info({ lojaId }, "Place already in DB, reusing");
  } else {
    const [inserted] = await db
      .insert(lojasTable)
      .values({
        nome,
        endereco,
        whatsapp: whatsapp ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        categoriaId,
        emDestaque: false,
      })
      .returning({ id: lojasTable.id });
    lojaId = inserted.id;
    req.log.info({ lojaId, nome }, "Saved new place to DB");
  }

  if (favoritar) {
    await db
      .insert(favoritosTable)
      .values({ lojaId })
      .onConflictDoNothing();
  }

  const [loja] = await db
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
    .where(eq(lojasTable.id, lojaId));

  res.status(201).json(loja);
});

export default router;
