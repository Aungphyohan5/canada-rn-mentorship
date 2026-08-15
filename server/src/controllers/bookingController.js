import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
    try {
        const {
            durationMinutes,
            amount,
            sessionType,
        } = req.body;

        if (!durationMinutes || !amount) {
            return res.status(400).json({
                success: false,
                message:
                    "Duration and amount are required",
            });
        }

        if (![45, 60].includes(Number(durationMinutes))) {
            return res.status(400).json({
                success: false,
                message:
                    "Duration must be either 45 or 60 minutes",
            });
        }

        const booking = await Booking.create({
            user: req.user._id,
            sessionType:
                sessionType ||
                "Canada RN Mentorship Session",
            durationMinutes: Number(durationMinutes),
            amount: Number(amount),
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