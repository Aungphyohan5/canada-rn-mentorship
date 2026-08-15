import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/database.js";

import authRoutes from "./routes/authRoutes.js";
import nurseProfileRoutes from "./routes/nurseProfileRoutes.js";
import pathwayRoutes from "./routes/pathwayRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import stripeWebhookRoutes from "./routes/stripeWebhookRoutes.js";
import schedulingRoutes from "./routes/schedulingRoutes.js";

dotenv.config();

console.log(
    "JWT_SECRET exists:",
    !!process.env.JWT_SECRET
);

console.log(
    "STRIPE_SECRET_KEY exists:",
    !!process.env.STRIPE_SECRET_KEY
);

connectDB();

const app = express();

app.use(cors());

/*
 * IMPORTANT:
 * Stripe webhook must come BEFORE express.json().
 *
 * Stripe needs the original raw request body
 * to verify the webhook signature.
 */
app.use(
    "/api/stripe/webhook",
    stripeWebhookRoutes
);

// Parse normal JSON request bodies
app.use(express.json());

/*
 * Health check
 */
app.get("/", (req, res) => {
    res.json({
        message:
            "Canada RN Mentorship By Tin Zar is Running",
    });
});

/*
 * API Routes
 */
app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/nurse-profile",
    nurseProfileRoutes
);

app.use(
    "/api/pathway",
    pathwayRoutes
);

app.use(
    "/api/bookings",
    bookingRoutes
);

app.use(
    "/api/payments",
    paymentRoutes
);

app.use(
    "/api/scheduling",
    schedulingRoutes
);

/*
 * Start Server
 */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});