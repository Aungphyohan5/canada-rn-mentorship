import axios from "axios";

const calendlyApi = axios.create({
    baseURL: "https://api.calendly.com",
    headers: {
        Authorization: `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
    },
});


/*
 * Get the connected Calendly user
 */
export const getCurrentCalendlyUser = async () => {
    const response = await calendlyApi.get(
        "/users/me"
    );

    return response.data.resource;
};


/*
 * Get scheduled Calendly events
 */
export const getCalendlyScheduledEvents = async ({
    userUri,
    minStartTime,
    maxStartTime,
}) => {
    const response = await calendlyApi.get(
        "/scheduled_events",
        {
            params: {
                user: userUri,
                min_start_time: minStartTime,
                max_start_time: maxStartTime,
                status: "active",
                count: 100,
            },
        }
    );

    return response.data.collection || [];
};


/*
 * Get invitees for a Calendly event
 */
export const getCalendlyEventInvitees = async (
    eventUri
) => {
    const eventId =
        eventUri.split("/").pop();

    const response = await calendlyApi.get(
        `/scheduled_events/${eventId}/invitees`
    );

    return response.data.collection || [];
};


/*
 * Get the full details of a Calendly event
 *
 * This is useful for retrieving the event location,
 * including Zoom information when Calendly provides it.
 */
export const getCalendlyEvent = async (
    eventUri
) => {
    const eventId =
        eventUri.split("/").pop();

    const response = await calendlyApi.get(
        `/scheduled_events/${eventId}`
    );

    return response.data.resource;
};

export const getCalendlyEventType = async (
    eventTypeUri
) => {
    const eventTypeId =
        eventTypeUri.split("/").pop();

    const response =
        await calendlyApi.get(
            `/event_types/${eventTypeId}`
        );

    return response.data.resource;
};