import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriasRouter from "./categorias";
import lojasRouter from "./lojas";
import favoritosRouter from "./favoritos";
import roteiroRouter from "./roteiro";
import placesRouter from "./places";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriasRouter);
router.use(lojasRouter);
router.use(favoritosRouter);
router.use(roteiroRouter);
router.use(placesRouter);

export default router;
