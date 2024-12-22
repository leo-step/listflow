import { Router } from "express";
import {
  createHook,
  deleteHook,
  updateHook,
} from "../controllers/hookController";

const router = Router();

// router.post("/create", createHook);
// router.post("/update", updateHook);
// router.post("/delete", deleteHook);
// should have test endpoint where you give it whatever email content you want
// and then it calls your hook by id right away

export default router;
