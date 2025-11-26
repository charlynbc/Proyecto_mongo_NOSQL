import { Router } from "express";
import { compararCanasta } from "../controllers/analytics.controller";

const router = Router();

// POST /analytics/canasta
router.post("/canasta", compararCanasta);

export default router;