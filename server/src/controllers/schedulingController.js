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
// Returns the latest paid mentorship booking that has not yet
// been scheduled through Calendly.
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
// Active bookings include:
//
// 1. Payment pending + booking pending
// 2. Payment paid + booking pending
// 3. Payment paid + booking scheduled
//
// Completed and cancelled bookings are not considered active.
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

            bookingStatus: {
                $in: [
                    "pending",
                    "scheduled",
                ],
            },

        }).sort({
            createdAt: -1,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "No active booking found.",
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
// Finds the user's Calendly appointment and synchronizes:
//
// - Booking status
// - Scheduled date/time
// - Calendly event URI
// - Calendly invitee URI
// - Zoom meeting URL
// - Zoom meeting ID
//
// This is used because Calendly Free does not provide the
// webhook functionality needed for instant synchronization.
//
// The Dashboard can call this endpoint after the user books
// through Calendly.
// ============================================================

export const syncMyCalendlyBooking = async (req, res) => {
    try {

        // ========================================================
        // 1. FIND THE USER'S LATEST PAID MENTORSHIP BOOKING
        // ========================================================

        const booking = await Booking.findOne({
            user: req.user._id,
            paymentStatus: "paid",
            sessionType: "Canada RN Mentorship Session",
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


        // ========================================================
        // 2. GET USER EMAIL
        // ========================================================

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


        // ========================================================
        // 3. GET CALENDLY USER
        // ========================================================

        const calendlyUser =
            await getCurrentCalendlyUser();


        if (!calendlyUser?.uri) {
            return res.status(500).json({
                success: false,
                message:
                    "Unable to identify the Calendly account.",
            });
        }


        // ========================================================
        // 4. SET CALENDLY SEARCH WINDOW
        // ========================================================
        //
        // Search from the MongoDB booking creation date through
        // one year into the future.
        //

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


        // ========================================================
        // 5. GET CALENDLY EVENTS
        // ========================================================

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


        // ========================================================
        // 6. FIND EVENTS BELONGING TO THIS USER
        // ========================================================
        //
        // We inspect invitees for every event and compare the
        // Calendly invitee email with the logged-in user's email.
        //

        const matchingEvents = [];

        for (const event of events) {
            try {
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

            } catch (inviteeError) {
                console.error(
                    "CALENDLY INVITEE ERROR:",
                    inviteeError.response?.data ||
                    inviteeError.message ||
                    inviteeError
                );
            }
        }


        console.log(
            "MATCHING CALENDLY EVENTS:",
            matchingEvents.map(
                ({ event }) => ({
                    uri: event.uri,
                    createdAt: event.created_at,
                    startTime: event.start_time,
                })
            )
        );


        // ========================================================
        // 7. SELECT THE CORRECT CALENDLY EVENT
        // ========================================================
        //
        // Prefer an event created after the MongoDB booking.
        // This helps prevent an older Calendly booking from
        // being incorrectly attached to a new payment.
        //

        const bookingCreatedAt =
            new Date(
                booking.createdAt
            );

        const newerMatchingEvents =
            matchingEvents.filter(
                ({ event }) =>
                    event.created_at &&
                    new Date(
                        event.created_at
                    ) >= bookingCreatedAt
            );


        const candidates =
            newerMatchingEvents.length > 0
                ? newerMatchingEvents
                : matchingEvents;


        // Sort newest event first
        candidates.sort(
            (a, b) =>
                new Date(
                    b.event.created_at
                ) -
                new Date(
                    a.event.created_at
                )
        );


        const selectedMatch =
            candidates[0] || null;


        const matchingEvent =
            selectedMatch?.event || null;

        const matchingInvitee =
            selectedMatch?.invitee || null;


        console.log(
            "SELECTED CALENDLY EVENT:",
            matchingEvent?.uri || "NONE"
        );

        console.log(
            "SELECTED CALENDLY EVENT CREATED AT:",
            matchingEvent?.created_at || "NONE"
        );


        // ========================================================
        // 8. NO CALENDLY BOOKING FOUND
        // ========================================================

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


        // ========================================================
        // 9. CALENDLY EVENT FOUND
        // ========================================================

        console.log(
            "MATCHING CALENDLY EVENT:",
            matchingEvent.uri
        );


        // ========================================================
        // 10. UPDATE BOOKING
        // ========================================================

        booking.bookingStatus =
            "scheduled";

        booking.scheduledAt =
            new Date(
                matchingEvent.start_time
            );

        booking.calendlyEventUri =
            matchingEvent.uri;

        booking.calendlyInviteeUri =
            matchingInvitee.uri;


        // ========================================================
        // 11. GET FULL CALENDLY EVENT
        // ========================================================

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


        // ========================================================
        // 12. GET CALENDLY LOCATION
        // ========================================================

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


        // ========================================================
        // 13. EXTRACT ZOOM INFORMATION
        // ========================================================

        let zoomJoinUrl = null;
        let zoomMeetingId = null;


        // Direct Zoom join URL
        if (location?.join_url) {
            zoomJoinUrl =
                location.join_url;
        }


        // Zoom information inside location.data
        if (
            !zoomJoinUrl &&
            location?.data?.join_url
        ) {
            zoomJoinUrl =
                location.data.join_url;
        }


        // Zoom meeting ID
        if (location?.data?.id) {
            zoomMeetingId =
                String(
                    location.data.id
                );
        }


        // ========================================================
        // 14. SAVE ZOOM JOIN URL
        // ========================================================

        if (zoomJoinUrl) {
            booking.zoomJoinUrl =
                zoomJoinUrl;

            console.log(
                "ZOOM JOIN URL SAVED:",
                zoomJoinUrl
            );

        } else {
            console.log(
                "NO ZOOM JOIN URL FOUND IN CALENDLY LOCATION"
            );
        }


        // ========================================================
        // 15. SAVE ZOOM MEETING ID
        // ========================================================

        if (zoomMeetingId) {
            booking.zoomMeetingId =
                zoomMeetingId;

            console.log(
                "ZOOM MEETING ID SAVED:",
                zoomMeetingId
            );
        }


        // ========================================================
        // 16. SAVE BOOKING
        // ========================================================

        await booking.save();


        // ========================================================
        // 17. SEND CONFIRMATION EMAIL
        // ========================================================
        //
        // Only send the confirmation email once.
        //
        // IMPORTANT:
        // emailService.js expects "name", not "firstName".
        //

        if (!booking.confirmationSent) {
            try {

                await sendMentorshipConfirmationEmail({
                    to: userEmail,

                    name:
                        req.user.firstName ||
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
                    "MENTORSHIP CONFIRMATION EMAIL SENT:",
                    userEmail
                );

            } catch (emailError) {

                // Email failure must not undo
                // the successful booking synchronization.

                console.error(
                    "MENTORSHIP EMAIL ERROR:",
                    emailError.response?.data ||
                    emailError.message ||
                    emailError
                );
            }
        }


        // ========================================================
        // 18. RETURN SUCCESS
        // ========================================================

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