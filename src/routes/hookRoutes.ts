import { Router } from "express";
import { createHook } from "../controllers/hookController";

const router = Router();

router.post("/create", createHook);
router.post("/update", () => {});
router.post("/delete", () => {});

export default router;
