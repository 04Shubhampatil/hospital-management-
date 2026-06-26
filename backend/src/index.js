import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctors.js";
import reportRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";
import doctorReportRoutes from "./routes/doctorReports.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "https://smart-hospital-crm.netlify.app",
      "https://hospital-management-gamma-two.vercel.app",
    ],
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorReportRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

app.get("/",(req,res)=>{
  res.send("Hello World");
})

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
