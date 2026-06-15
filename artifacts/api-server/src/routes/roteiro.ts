import { Router, type IRouter } from "express";
import { db, lojasTable, categoriasTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { CalcularRoteiroBody, CalcularRoteiroResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.post("/roteiro", async (req, res): Promise<void> => {
  const parsed = CalcularRoteiroBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lojaIds } = parsed.data;

  if (lojaIds.length === 0) {
    res.status(400).json({ error: "Selecione ao menos uma loja" });
    return;
  }

  if (lojaIds.length > 10) {
    res.status(400).json({ error: "Máximo de 10 lojas por roteiro" });
    return;
  }

  const lojas = await db
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
    .where(inArray(lojasTable.id, lojaIds));

  const ordered = lojaIds
    .map((id) => lojas.find((l) => l.id === id))
    .filter(Boolean) as typeof lojas;

  let distanciaTotal = 0;
  let tempoTotal = 0;

  const paradas = ordered.map((loja, i) => {
    let distanciaAnterior: number | null = null;
    let tempoEstimado: number | null = null;

    if (i > 0) {
      const prev = ordered[i - 1];
      if (
        prev.latitude != null && prev.longitude != null &&
        loja.latitude != null && loja.longitude != null
      ) {
        const dist = haversineKm(prev.latitude, prev.longitude, loja.latitude, loja.longitude);
        distanciaAnterior = Math.round(dist * 100) / 100;
        tempoEstimado = Math.max(5, Math.round(dist * 12));
        distanciaTotal += distanciaAnterior;
        tempoTotal += tempoEstimado;
      } else {
        distanciaAnterior = 0.3;
        tempoEstimado = 5;
        distanciaTotal += 0.3;
        tempoTotal += 5;
      }
    }

    return {
      ordem: i + 1,
      loja,
      distanciaAnterior,
      tempoEstimado,
    };
  });

  const destinos = ordered
    .filter((l) => l.latitude != null && l.longitude != null)
    .map((l) => `${l.latitude},${l.longitude}`)
    .join("/");

  const mapUrl = destinos
    ? `https://www.google.com/maps/dir/${destinos}`
    : `https://www.google.com/maps/search/${encodeURIComponent(ordered[0]?.nome ?? "Brás SP")}`;

  res.json(
    CalcularRoteiroResponse.parse({
      paradas,
      distanciaTotal: Math.round(distanciaTotal * 100) / 100,
      tempoTotal,
      mapUrl,
    }),
  );
});

export default router;
