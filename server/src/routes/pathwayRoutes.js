import express from "express";

import { getMyPathway } from "../controllers/pathwayController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/me",
    protect,
    authorize("nurse"),
    getMyPathway
);

export default router;