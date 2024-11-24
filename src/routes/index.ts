import { Router } from "express";
import searchRoutes from "./searchRoutes";

const router = Router();

router.use("/search", searchRoutes);

export default router;
