import express from "express";

import {
    createBooking,
    getMyBookings,
} from "../controllers/bookingController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/me",
    protect,
    authorize("nurse"),
    getMyBookings
);

router.post(
    "/",
    protect,
    authorize("nurse"),
    createBooking
);

export default router;