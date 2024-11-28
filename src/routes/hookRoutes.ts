import { Router } from "express";
import {
  createHook,
  deleteHook,
  updateHook,
} from "../controllers/hookController";

const router = Router();

router.post("/create", createHook);
router.post("/update", updateHook);
router.post("/delete", deleteHook);

export default router;
