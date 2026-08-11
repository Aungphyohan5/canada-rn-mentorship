import express from "express";

import {
    createOrUpdateProfile,
    getMyProfile,
} from "../controllers/nurseProfileController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/me",
    protect,
    authorize("nurse"),
    getMyProfile
);

router.put(
    "/me",
    protect,
    authorize("nurse"),
    createOrUpdateProfile
);

export default router;