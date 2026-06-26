import { Router } from "express";
import { createDoctor, listDoctors, getDoctor, updateDoctor } from "../controllers/doctorController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.post("/", authenticate, authorize("ADMIN"), createDoctor);
router.get("/", listDoctors);
router.get("/:id", getDoctor);
router.patch("/:id", authenticate, authorize("ADMIN"), updateDoctor);

export default router;
