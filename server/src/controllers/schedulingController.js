import Booking from "../models/Booking.js";

import {
    getCurrentCalendlyUser,
    getCalendlyScheduledEvents,
    getCalendlyEventInvitees,
    getCalendlyEvent,
} from "../services/calendlyService.js";

import {
    sendMentorshipConfirmationEmail,
} from "../services/emailService.js";




// ============================================================
// GET MY PAID BOOKING
// ============================================================

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


// ============================================================
// GET MY ACTIVE BOOKING
// ============================================================
//
// Active means:
// - payment pending + booking pending
// - payment paid + booking pending
//
// Scheduled bookings are not considered "active" here.
// ============================================================

export const getMyActiveBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            user: req.user._id,

            paymentStatus: {
                $in: [
                    "pending",
                    "paid",
                ],
            },

            bookingStatus: "pending",

        }).sort({
            createdAt: -1,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message:
                    "No active booking found.",
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
            "GET ACTIVE BOOKING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// ============================================================
// SYNC CALENDLY BOOKING
// ============================================================
//
// This function:
// 1. Finds the user's latest paid mentorship booking
// 2. Looks for the user's Calendly appointment
// 3. Saves Calendly event/invitee information
// 4. Saves scheduled date/time
// 5. Retrieves Zoom information
// 6. Saves Zoom join URL
//
// It works for BOTH:
// - paid + pending
// - paid + scheduled
//
// This allows us to refresh Zoom information later.
// ============================================================

export const syncMyCalendlyBooking = async (
    req,
    res
) => {

    try {

        /*
         * Find the latest paid mentorship booking.
         *
         * IMPORTANT:
         * We do NOT require bookingStatus === "pending"
         * here because the booking may already be scheduled.
         */
        const booking = await Booking.findOne({
            user: req.user._id,
            paymentStatus: "paid",
            sessionType:
                "Canada RN Mentorship Session",
        }).sort({
            createdAt: -1,
        });


        if (!booking) {
            return res.status(404).json({
                success: false,
                message:
                    "No paid mentorship booking found.",
            });
        }


        /*
         * Get logged-in user's email.
         */
        const userEmail =
            req.user.email
                ?.trim()
                .toLowerCase();


        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account email is required.",
            });
        }


        /*
         * Get Calendly account.
         */
        const calendlyUser =
            await getCurrentCalendlyUser();


        /*
         * Search from booking creation date
         * through one year into the future.
         */
        const minStartTime =
            new Date(
                booking.createdAt
            ).toISOString();


        const maxStartTime =
            new Date(
                Date.now() +
                365 *
                24 *
                60 *
                60 *
                1000
            ).toISOString();


        /*
         * Get scheduled Calendly events.
         */
        const events =
            await getCalendlyScheduledEvents({
                userUri:
                    calendlyUser.uri,

                minStartTime,

                maxStartTime,
            });


        console.log(
            "CALENDLY EVENTS FOUND:",
            events.length
        );


        /*
         * Find the event belonging
         * to the logged-in user's email.
         */
        /*
 * Find Calendly events belonging to this user.
 *
 * IMPORTANT:
 * A user may have multiple Calendly bookings.
 * We therefore do NOT simply take the first match.
 *
 * We prefer events created AFTER this payment/booking
 * was created.
 */

        const matchingEvents = [];

        for (const event of events) {

            const invitees =
                await getCalendlyEventInvitees(
                    event.uri
                );

            const invitee =
                invitees.find(
                    (item) =>
                        item.email
                            ?.trim()
                            .toLowerCase() ===
                        userEmail
                );

            if (invitee) {

                matchingEvents.push({
                    event,
                    invitee,
                });
            }
        }


        console.log(
            "MATCHING CALENDLY EVENTS:",
            matchingEvents.map(
                ({ event }) => ({
                    uri: event.uri,
                    createdAt: event.created_at,
                    startTime: event.start_time,
                    location: event.location,
                })
            )
        );


        /*
         * Prefer a Calendly event created AFTER
         * our MongoDB booking was created.
         */
        const bookingCreatedAt =
            new Date(
                booking.createdAt
            );


        const newerMatchingEvents =
            matchingEvents.filter(
                ({ event }) =>
                    new Date(
                        event.created_at
                    ) >= bookingCreatedAt
            );


        /*
         * Choose the newest matching event.
         *
         * If no event was created after the booking,
         * fall back to the newest matching event.
         */
        const candidates =
            newerMatchingEvents.length > 0
                ? newerMatchingEvents
                : matchingEvents;


        candidates.sort(
            (a, b) =>
                new Date(
                    b.event.created_at
                ) -
                new Date(
                    a.event.created_at
                )
        );


        const matchingEvent =
            candidates[0]?.event || null;

        const matchingInvitee =
            candidates[0]?.invitee || null;


        console.log(
            "SELECTED CALENDLY EVENT:",
            matchingEvent?.uri
        );

        console.log(
            "SELECTED CALENDLY EVENT CREATED AT:",
            matchingEvent?.created_at
        );


        /*
         * No Calendly appointment found.
         */
        if (
            !matchingEvent ||
            !matchingInvitee
        ) {

            return res.status(200).json({
                success: true,

                scheduled: false,

                message:
                    "No Calendly appointment found yet.",

                data: {
                    booking,
                },
            });
        }


        /*
         * ====================================================
         * CALENDLY EVENT FOUND
         * ====================================================
         */

        console.log(
            "MATCHING CALENDLY EVENT:",
            matchingEvent.uri
        );


        /*
         * Update booking status.
         */
        booking.bookingStatus =
            "scheduled";


        /*
         * Save scheduled date/time.
         */
        booking.scheduledAt =
            new Date(
                matchingEvent.start_time
            );


        /*
         * Save Calendly references.
         */
        booking.calendlyEventUri =
            matchingEvent.uri;


        booking.calendlyInviteeUri =
            matchingInvitee.uri;


        /*
         * ====================================================
         * GET FULL CALENDLY EVENT
         * ====================================================
         */

        const fullEvent =
            await getCalendlyEvent(
                matchingEvent.uri
            );


        console.log(
            "CALENDLY FULL EVENT:",
            JSON.stringify(
                fullEvent,
                null,
                2
            )
        );


        /*
         * ====================================================
         * GET LOCATION
         * ====================================================
         */

        const location =
            fullEvent?.location;


        console.log(
            "CALENDLY LOCATION:",
            JSON.stringify(
                location,
                null,
                2
            )
        );


        /*
         * ====================================================
         * SAVE ZOOM INFORMATION
         * ====================================================
         */

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


        /*
         * Save everything to MongoDB.
         */
        await booking.save();

        /*
         * Send confirmation email only once.
         */
        if (!booking.confirmationSent) {
            try {
                await sendMentorshipConfirmationEmail({
                    to: userEmail,
                    firstName:
                        req.user.firstName ||
                        "there",
                    scheduledAt:
                        booking.scheduledAt,
                    zoomJoinUrl:
                        booking.zoomJoinUrl,
                });

                booking.confirmationSent = true;

                await booking.save();

                console.log(
                    "MENTORSHIP CONFIRMATION EMAIL SENT:",
                    userEmail
                );

            } catch (emailError) {
                /*
                 * Email failure should NOT undo
                 * the successful Calendly synchronization.
                 */
                console.error(
                    "MENTORSHIP EMAIL ERROR:",
                    emailError
                );
            }
        }

        return res.status(200).json({

            success: true,

            scheduled: true,

            message:
                "Calendly booking synchronized successfully.",

            data: {
                booking,
            },

        });


    } catch (error) {

        console.error(
            "SYNC CALENDLY BOOKING ERROR:",
            error.response?.data ||
            error.message ||
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to synchronize Calendly booking.",

        });

    }
};