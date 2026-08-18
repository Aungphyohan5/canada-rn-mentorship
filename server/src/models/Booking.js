import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        sessionType: {
            type: String,
            default: "Canada RN Mentorship Session",
            trim: true,
        },

        durationMinutes: {
            type: Number,
            required: true,
            enum: [45, 60],
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "CAD",
            uppercase: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "cancelled"],
            default: "pending",
        },

        stripePaymentId: {
            type: String,
            default: "",
        },

        scheduledAt: {
            type: Date,
            default: null,
        },

        bookingStatus: {
            type: String,
            enum: [
                "pending",
                "scheduled",
                "completed",
                "cancelled",
            ],
            default: "pending",
        },

        calendlyEventUri: {
            type: String,
            default: "",
        },

        calendlyInviteeUri: {
            type: String,
            default: "",
        },

        zoomMeetingId: {
            type: String,
            default: "",
        },

        zoomJoinUrl: {
            type: String,
            default: "",
        },

        confirmationSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Booking", bookingSchema);