import { Router } from "express";
import { find } from "../controllers/searchController";

const router = Router();

router.post("/find", find);

export default router;
