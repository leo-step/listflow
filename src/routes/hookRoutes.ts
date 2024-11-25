import { Router } from "express";
import { createHook } from "../controllers/hookController";

const router = Router();

router.post("/create", createHook);

export default router;
