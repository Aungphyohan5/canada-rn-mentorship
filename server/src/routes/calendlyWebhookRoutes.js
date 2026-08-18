import express from "express";

import {
    handleCalendlyWebhook,
} from "../controllers/calendlyWebhookController.js";

const router = express.Router();

router.post(
    "/",
    express.raw({
        type: "application/json",
    }),
    handleCalendlyWebhook
);

export default router;