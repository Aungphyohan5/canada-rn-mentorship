import Booking from "../models/Booking.js";

import {
    getCalendlyEventInvitees,
    getCalendlyEvent,
} from "../services/calendlyService.js";

import {
    sendMentorshipConfirmationEmail,
} from "../services/emailService.js";

export const handleCalendlyWebhook = async (
    req,
    res
) => {
    try {
        const payload = JSON.parse(
            req.body.toString()
        );

        console.log(
            "CALENDLY WEBHOOK RECEIVED:",
            JSON.stringify(
                payload,
                null,
                2
            )
        );

        const event =
            payload.event;

        const invitee =
            payload.payload?.invitee;

        /*
         * We currently care about a newly created
         * Calendly invitee.
         */
        if (
            event !== "invitee.created"
        ) {
            return res.status(200).json({
                success: true,
                message:
                    "Webhook received but event is not handled.",
            });
        }

        if (!invitee?.email) {
            return res.status(400).json({
                success: false,
                message:
                    "Invitee email is missing.",
            });
        }

        const inviteeEmail =
            invitee.email
                .trim()
                .toLowerCase();

        console.log(
            "CALENDLY INVITEE EMAIL:",
            inviteeEmail
        );

        /*
         * Find a paid mentorship booking
         * belonging to this email.
         *
         * Booking currently stores user ID,
         * so we populate the user.
         */
        const bookings =
            await Booking.find({
                paymentStatus: "paid",
                bookingStatus: "pending",
            })
                .populate(
                    "user",
                    "email firstName lastName"
                )
                .sort({
                    createdAt: -1,
                });

        const booking =
            bookings.find(
                (item) =>
                    item.user?.email
                        ?.trim()
                        .toLowerCase() ===
                    inviteeEmail
            );

        if (!booking) {
            console.log(
                "NO MATCHING PAID BOOKING:",
                inviteeEmail
            );

            /*
             * Return 200 so Calendly does not
             * repeatedly retry an event that
             * does not belong to a booking.
             */
            return res.status(200).json({
                success: true,
                scheduled: false,
                message:
                    "No matching paid booking found.",
            });
        }

        /*
         * Get the Calendly event URI.
         */
        const eventUri =
            invitee.event;

        if (!eventUri) {
            return res.status(400).json({
                success: false,
                message:
                    "Calendly event URI is missing.",
            });
        }

        /*
         * Get complete Calendly event details.
         */
        const calendlyEvent =
            await getCalendlyEvent(
                eventUri
            );

        /*
         * Get invitees from the event.
         */
        const invitees =
            await getCalendlyEventInvitees(
                eventUri
            );

        const matchingInvitee =
            invitees.find(
                (item) =>
                    item.email
                        ?.trim()
                        .toLowerCase() ===
                    inviteeEmail
            );

        /*
         * Update booking.
         */
        booking.bookingStatus =
            "scheduled";

        booking.scheduledAt =
            new Date(
                calendlyEvent.start_time
            );

        booking.calendlyEventUri =
            calendlyEvent.uri;

        if (matchingInvitee) {
            booking.calendlyInviteeUri =
                matchingInvitee.uri;
        }

        /*
         * Save Zoom information.
         */
        const location =
            calendlyEvent.location;

        if (
            location?.join_url
        ) {
            booking.zoomJoinUrl =
                location.join_url;
        }

        if (
            location?.data?.id
        ) {
            booking.zoomMeetingId =
                String(
                    location.data.id
                );
        }

        await booking.save();

        console.log(
            "BOOKING MARKED SCHEDULED:",
            booking._id
        );

        /*
         * Send confirmation email once.
         */
        if (
            !booking.confirmationSent
        ) {
            try {
                await sendMentorshipConfirmationEmail({
                    to: inviteeEmail,

                    firstName:
                        booking.user?.firstName ||
                        "there",

                    scheduledAt:
                        booking.scheduledAt,

                    zoomJoinUrl:
                        booking.zoomJoinUrl,
                });

                booking.confirmationSent =
                    true;

                await booking.save();

                console.log(
                    "CONFIRMATION EMAIL SENT:",
                    inviteeEmail
                );

            } catch (emailError) {
                console.error(
                    "CONFIRMATION EMAIL ERROR:",
                    emailError
                );
            }
        }

        return res.status(200).json({
            success: true,
            scheduled: true,
            message:
                "Calendly booking processed successfully.",
            data: {
                booking,
            },
        });

    } catch (error) {
        console.error(
            "CALENDLY WEBHOOK ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to process Calendly webhook.",
        });
    }
};