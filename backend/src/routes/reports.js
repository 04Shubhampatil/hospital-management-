import { Router } from "express";
import upload from "../middlewares/upload.js";
import { authenticate } from "../middlewares/auth.js";
import {
  uploadReport,
  getMyReports,
  getReport,
  extractTextFromReport,
  analyzeReport,
} from "../controllers/reportController.js";

const router = Router();

router.post("/upload", authenticate, upload.single("file"), uploadReport);
router.get("/my", authenticate, getMyReports);
router.get("/:id", authenticate, getReport);
router.post("/:id/extract-text", authenticate, extractTextFromReport);
router.post("/:id/analyze", authenticate, analyzeReport);

export default router;
