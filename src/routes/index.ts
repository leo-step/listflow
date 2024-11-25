import { Router } from "express";
import searchRoutes from "./searchRoutes";
import hookRoutes from "./hookRoutes";

const router = Router();

router.use("/search", searchRoutes);
router.use("/hook", hookRoutes);

export default router;
