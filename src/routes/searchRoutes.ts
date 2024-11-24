import { Router } from "express";
import { findAll } from "../controllers/searchController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.post("/findall", findAll);

export default router;
