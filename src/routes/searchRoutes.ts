import { Router } from "express";
import { findAll } from "../controllers/searchController";

const router = Router();

router.post("/findall", findAll);

export default router;
