import bcrypt from "bcryptjs";
import User from "../models/User.js";
import DoctorProfile from "../models/DoctorProfile.js";

export async function createDoctor(req, res, next) {
  try {
    const { name, email, password, category, specialization, experienceYears } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: "DOCTOR" });
    const profile = await DoctorProfile.create({
      userId: user._id,
      category,
      specialization,
      experienceYears,
    });

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, profile });
  } catch (err) {
    next(err);
  }
}

export async function listDoctors(req, res, next) {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === "true";

    const profiles = await DoctorProfile.find(filter).populate("userId", "name email");
    res.json(profiles);
  } catch (err) {
    next(err);
  }
}

export async function getDoctor(req, res, next) {
  try {
    const profile = await DoctorProfile.findById(req.params.id).populate("userId", "name email");
    if (!profile) return res.status(404).json({ message: "Doctor not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateDoctor(req, res, next) {
  try {
    const profile = await DoctorProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!profile) return res.status(404).json({ message: "Doctor not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}
