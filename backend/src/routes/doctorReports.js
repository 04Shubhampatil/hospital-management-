import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { getAssignedReports, markReviewed } from "../controllers/doctorReportController.js";

const router = Router();

router.get("/reports", authenticate, authorize("DOCTOR"), getAssignedReports);
router.patch("/reports/:id/mark-reviewed", authenticate, authorize("DOCTOR"), markReviewed);

export default router;
