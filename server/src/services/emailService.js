// ============================================================
// EMAIL SERVICE — RESEND API
// ============================================================

const RESEND_API_URL = "https://api.resend.com/emails";

const EMAIL_FROM =
    process.env.EMAIL_FROM ||
    "Canada RN Mentorship <onboarding@resend.dev>";


// ============================================================
// ESCAPE HTML CONTENT
// ============================================================

const escapeHtml = (value = "") => {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};


// ============================================================
// SEND EMAIL THROUGH RESEND
// ============================================================

const sendEmail = async ({
    to,
    subject,
    html,
}) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error(
            "RESEND_API_KEY is not configured."
        );
    }

    if (!to) {
        throw new Error(
            "Recipient email address is missing."
        );
    }

    const response = await fetch(
        RESEND_API_URL,
        {
            method: "POST",

            headers: {
                Authorization:
                    `Bearer ${process.env.RESEND_API_KEY}`,

                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                from: EMAIL_FROM,
                to: [to],
                subject,
                html,
            }),
        }
    );

    const responseData =
        await response.json();

    if (!response.ok) {
        console.error(
            "RESEND API ERROR:",
            responseData
        );

        throw new Error(
            responseData?.message ||
            "Resend email delivery failed."
        );
    }

    console.log(
        "✅ EMAIL SENT THROUGH RESEND:",
        responseData?.id || "No email ID returned"
    );

    return responseData;
};


// ============================================================
// MENTORSHIP CONFIRMATION EMAIL
// ============================================================

export const sendMentorshipConfirmationEmail = async ({
    to,
    firstName,
    scheduledAt,
    zoomJoinUrl,
}) => {
    const recipientName =
        escapeHtml(firstName || "there");

    const formattedDate = scheduledAt
        ? new Date(scheduledAt).toLocaleString(
            "en-CA",
            {
                dateStyle: "full",
                timeStyle: "short",
            }
        )
        : "Your scheduled appointment time";

    const safeDate =
        escapeHtml(formattedDate);

    const safeZoomUrl =
        escapeHtml(zoomJoinUrl || "");

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172033;">
            <h2 style="color: #10233f;">
                Your Canada RN Mentorship Session Is Confirmed
            </h2>

            <p>Hello ${recipientName},</p>

            <p>
                Your Canada RN Mentorship session has been
                successfully scheduled.
            </p>

            <p>
                <strong>Date and time:</strong><br />
                ${safeDate}
            </p>

            ${zoomJoinUrl
            ? `
                        <p>
                            <strong>Zoom meeting:</strong><br />
                            <a
                                href="${safeZoomUrl}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Join Zoom Meeting
                            </a>
                        </p>
                    `
            : `
                        <p>
                            Your Zoom meeting link will be
                            provided separately.
                        </p>
                    `
        }

            <p>
                Please keep this email for your records.
            </p>

            <p>
                Best regards,<br />
                Canada RN Mentorship
            </p>
        </div>
    `;

    return sendEmail({
        to,
        subject:
            "Your Canada RN Mentorship Session Is Confirmed",
        html,
    });
};


// ============================================================
// PAYMENT RECEIVED EMAIL
// ============================================================

export const sendPaymentReceivedEmail = async ({
    to,
    firstName,
    amount,
    currency = "CAD",
    sessionType = "Canada RN Mentorship Session",
}) => {
    const recipientName =
        escapeHtml(firstName || "there");

    const formattedAmount =
        new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",
                currency,
            }
        ).format(Number(amount || 0));

    const safeSessionType =
        escapeHtml(sessionType);

    const safeAmount =
        escapeHtml(formattedAmount);

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172033;">
            <h2 style="color: #10233f;">
                Payment Received
            </h2>

            <p>Hello ${recipientName},</p>

            <p>
                We have successfully received your payment
                for your Canada RN Mentorship session.
            </p>

            <p>
                <strong>Session:</strong><br />
                ${safeSessionType}
            </p>

            <p>
                <strong>Amount paid:</strong><br />
                ${safeAmount}
            </p>

            <p>
                You can now return to your dashboard and
                arrange your mentorship session.
            </p>

            <p>
                Best regards,<br />
                Canada RN Mentorship
            </p>
        </div>
    `;

    return sendEmail({
        to,
        subject:
            "Payment Received — Canada RN Mentorship",
        html,
    });
};