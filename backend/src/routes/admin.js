import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { getAllReports, assignDoctor, reanalyzeReport } from "../controllers/adminController.js";

const router = Router();

router.get("/reports", authenticate, authorize("ADMIN"), getAllReports);
router.patch("/reports/:id/assign-doctor", authenticate, authorize("ADMIN"), assignDoctor);
router.post("/reports/:id/reanalyze", authenticate, authorize("ADMIN"), reanalyzeReport);

export default router;
