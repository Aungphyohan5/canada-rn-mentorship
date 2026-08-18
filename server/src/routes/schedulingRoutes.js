import express from "express";

import {
    getMyPaidBooking,
    getMyActiveBooking,
    syncMyCalendlyBooking,
} from "../controllers/schedulingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get(
    "/my-paid-booking",
    getMyPaidBooking
);

router.get(
    "/my-active-booking",
    getMyActiveBooking
);

router.get(
    "/sync-calendly",
    syncMyCalendlyBooking
);

export default router;