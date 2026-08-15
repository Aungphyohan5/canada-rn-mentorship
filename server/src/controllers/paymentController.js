import stripe from "../config/stripe.js";
import Booking from "../models/Booking.js";

const SESSION_PRICE_CENTS = 12500;
const SESSION_DURATION_MINUTES = 45;

export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user._id;

        // Create our internal booking first.
        const booking = await Booking.create({
            user: userId,
            sessionType: "Canada RN Mentorship Session",
            durationMinutes: SESSION_DURATION_MINUTES,
            amount: 125,
            currency: "CAD",
            paymentStatus: "pending",
            bookingStatus: "pending",
        });

        const session = await stripe.checkout.sessions.create({
            mode: "payment",

            line_items: [
                {
                    price_data: {
                        currency: "cad",
                        product_data: {
                            name:
                                "Canada RN Mentorship Session",
                            description:
                                "45-minute one-on-one mentorship session",
                        },
                        unit_amount: SESSION_PRICE_CENTS,
                    },
                    quantity: 1,
                },
            ],

            metadata: {
                bookingId: booking._id.toString(),
                userId: userId.toString(),
            },

            success_url:
                `${process.env.FRONTEND_URL}` +
                "/booking/success?session_id={CHECKOUT_SESSION_ID}",

            cancel_url:
                `${process.env.FRONTEND_URL}` +
                "/booking/cancelled",
        });

        booking.stripePaymentId = session.id;
        await booking.save();

        return res.status(200).json({
            success: true,
            data: {
                checkoutUrl: session.url,
                bookingId: booking._id,
            },
        });
    } catch (error) {
        console.error(
            "CREATE CHECKOUT SESSION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create payment session",
        });
    }
};