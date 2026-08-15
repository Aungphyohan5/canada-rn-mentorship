import stripe from "../config/stripe.js";
import Booking from "../models/Booking.js";

export const handleStripeWebhook = async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error(
            "STRIPE WEBHOOK SIGNATURE ERROR:",
            error.message
        );

        return res.status(400).send(
            `Webhook Error: ${error.message}`
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;

                const bookingId =
                    session.metadata?.bookingId;

                if (!bookingId) {
                    console.error(
                        "No bookingId found in Stripe metadata"
                    );

                    break;
                }

                const booking =
                    await Booking.findById(bookingId);

                if (!booking) {
                    console.error(
                        "Booking not found:",
                        bookingId
                    );

                    break;
                }

                if (
                    session.payment_status === "paid"
                ) {
                    booking.paymentStatus = "paid";

                    await booking.save();

                    console.log(
                        "✅ Booking marked as paid:",
                        booking._id.toString()
                    );
                }

                break;
            }

            default:
                break;
        }

        return res.json({
            received: true,
        });
    } catch (error) {
        console.error(
            "STRIPE WEBHOOK PROCESSING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Webhook processing failed",
        });
    }
};