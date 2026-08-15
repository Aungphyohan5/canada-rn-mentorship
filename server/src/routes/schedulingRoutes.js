import express from "express";

import {
    getMyPaidBooking,
} from "../controllers/schedulingController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/my-paid-booking",
    protect,
    authorize("nurse"),
    getMyPaidBooking
);

export default router;