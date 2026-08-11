import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import nurseProfileRoutes from "./routes/nurseProfileRoutes.js";

dotenv.config();
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

connectDB();

const app = express();

app.use(cors());

// Parse JSON request bodies
app.use(express.json());



app.get("/", (req, res) => {
    res.json({
        message: "Canada RN Mentorship By Tin Zar is Running",
    });
});


app.use("/api/auth", authRoutes);
app.use("/api/nurse-profile", nurseProfileRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});