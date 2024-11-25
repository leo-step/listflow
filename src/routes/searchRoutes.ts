import { Router } from "express";
import { aggregate, find } from "../controllers/searchController";

const router = Router();

router.post("/find", find);
router.post("/aggregate", aggregate);

export default router;
