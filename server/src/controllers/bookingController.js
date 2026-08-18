import Booking from "../models/Booking.js";

const SESSION_DURATION_MINUTES = 45;
const SESSION_AMOUNT = 125;

export const createBooking = async (req, res) => {
    try {
        const userId = req.user._id;

        // Prevent duplicate active paid bookings
        const existingPaidBooking =
            await Booking.findOne({
                user: userId,
                paymentStatus: "paid",
                bookingStatus: "pending",
            }).sort({
                createdAt: -1,
            });

        if (existingPaidBooking) {
            return res.status(400).json({
                success: false,
                code: "PAID_BOOKING_EXISTS",
                message:
                    "You already have a paid mentorship session waiting to be scheduled.",
                data: {
                    booking: existingPaidBooking,
                },
            });
        }

        // Server-controlled session details
        const booking = await Booking.create({
            user: userId,

            sessionType:
                "Canada RN Mentorship Session",

            durationMinutes:
                SESSION_DURATION_MINUTES,

            amount: SESSION_AMOUNT,

            currency: "CAD",

            paymentStatus: "pending",

            bookingStatus: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: {
                booking,
            },
        });

    } catch (error) {
        console.error(
            "CREATE BOOKING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            data: {
                bookings,
            },
        });

    } catch (error) {
        console.error(
            "GET BOOKINGS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};