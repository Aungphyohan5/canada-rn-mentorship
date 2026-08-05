import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";


dotenv.config();
connectDB();


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Canada RN Mentorship By Tin Zar is Runnning" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});