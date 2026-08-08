import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log("METHOD:", req.method);
    console.log("URL:", req.url);
    console.log("CONTENT-TYPE:", req.headers["content-type"]);
    console.log("BODY:", req.body);
    next();
});

app.get("/", (req, res) => {
    res.json({
        message: "Canada RN Mentorship By Tin Zar is Running",
    });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});