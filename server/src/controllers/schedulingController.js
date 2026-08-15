import Booking from "../models/Booking.js";

export const getMyPaidBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            user: req.user._id,
            paymentStatus: "paid",
            bookingStatus: "pending",
        }).sort({
            createdAt: -1,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message:
                    "No paid booking is waiting to be scheduled.",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                booking,
            },
        });
    } catch (error) {
        console.error(
            "GET PAID BOOKING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};