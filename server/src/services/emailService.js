const DEFAULT_EMAIL_FROM =
    "Canada RN Mentorship <onboarding@resend.dev>";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Send an email through Resend API.
 */
const sendEmail = async ({ to, subject, html }) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        throw new Error("RESEND_API_KEY is not configured");
    }

    if (!to) {
        throw new Error("Recipient email address is required");
    }

    if (!subject) {
        throw new Error("Email subject is required");
    }

    if (!html) {
        throw new Error("Email HTML content is required");
    }

    const emailFrom =
        process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM;

    const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: emailFrom,
            to: [to],
            subject,
            html,
        }),
    });

    const responseText = await response.text();

    let responseData;

    try {
        responseData = JSON.parse(responseText);
    } catch {
        responseData = {
            raw: responseText,
        };
    }

    if (!response.ok) {
        console.error("Resend email error:", {
            status: response.status,
            response: responseData,
        });

        throw new Error(
            responseData?.message ||
            responseData?.error ||
            "Failed to send email through Resend"
        );
    }

    console.log("Email sent successfully through Resend:", {
        to,
        subject,
        response: responseData,
    });

    return responseData;
};

/**
 * Send mentorship booking confirmation email.
 */
export const sendMentorshipConfirmationEmail = async ({
    to,
    name,
    scheduledAt,
    zoomJoinUrl,
}) => {
    const formattedDate = new Date(scheduledAt).toLocaleString(
        "en-CA",
        {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: "America/Halifax",
        }
    );

    const recipientName = name || "there";

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <h2 style="color: #17324d;">
                Canada RN Mentorship Session Confirmed
            </h2>

            <p>Hello ${recipientName},</p>

            <p>
                Your Canada RN Mentorship session has been confirmed.
            </p>

            <p>
                <strong>Session date and time:</strong><br />
                ${formattedDate}
            </p>

            ${zoomJoinUrl
            ? `
                        <p>
                            <strong>Join your Zoom session:</strong><br />
                            <a
                                href="${zoomJoinUrl}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Join Zoom Meeting
                            </a>
                        </p>
                    `
            : `
                        <p>
                            Your Zoom meeting link will be provided once
                            the session details are finalized.
                        </p>
                    `
        }

            <p>
                Please keep this email for your records.
            </p>

            <p>
                Best regards,<br />
                <strong>Canada RN Mentorship</strong>
            </p>
        </div>
    `;

    return sendEmail({
        to,
        subject: "Your Canada RN Mentorship Session Is Confirmed",
        html,
    });
};

/**
 * Send payment confirmation email.
 */
export const sendPaymentReceivedEmail = async ({
    to,
    name,
    amount,
    currency = "CAD",
    sessionType = "Canada RN Mentorship",
}) => {
    const recipientName = name || "there";

    const formattedAmount = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency,
    }).format(Number(amount || 0));

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <h2 style="color: #17324d;">
                Payment Received
            </h2>

            <p>Hello ${recipientName},</p>

            <p>
                We have successfully received your payment for
                <strong>${sessionType}</strong>.
            </p>

            <p>
                <strong>Amount paid:</strong><br />
                ${formattedAmount}
            </p>

            <p>
                Your mentorship booking has been recorded successfully.
            </p>

            <p>
                You will receive your session details and Zoom meeting link
                once the appointment has been confirmed.
            </p>

            <p>
                Thank you for choosing Canada RN Mentorship.
            </p>

            <p>
                Best regards,<br />
                <strong>Canada RN Mentorship</strong>
            </p>
        </div>
    `;

    return sendEmail({
        to,
        subject: "Payment Received — Canada RN Mentorship",
        html,
    });
};


// =========================================================
// PASSWORD RESET EMAIL
// =========================================================

export const sendPasswordResetEmail = async ({
    to,
    name,
    resetUrl,
}) => {
    const recipientName =
        name || "there";

    const html = `
        <div
            style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                max-width: 600px;
                margin: 0 auto;
            "
        >

            <h2
                style="
                    color: #17324d;
                    margin-bottom: 20px;
                "
            >
                Reset Your Password
            </h2>

            <p>
                Hello ${recipientName},
            </p>

            <p>
                We received a request to reset the password
                for your Canada RN Mentorship account.
            </p>

            <p>
                Click the button below to create a new password.
            </p>

            <p style="margin: 30px 0;">
                <a
                    href="${resetUrl}"
                    style="
                        display: inline-block;
                        background: #df2b2f;
                        color: #ffffff;
                        text-decoration: none;
                        padding: 13px 22px;
                        border-radius: 8px;
                        font-weight: 700;
                    "
                >
                    Reset My Password
                </a>
            </p>

            <p>
                This password reset link will expire in
                <strong>1 hour</strong>.
            </p>

            <p>
                If you did not request a password reset,
                you can safely ignore this email.
            </p>

            <p>
                If the button does not work, copy and paste
                the following link into your browser:
            </p>

            <p
                style="
                    word-break: break-all;
                    color: #68758a;
                    font-size: 13px;
                "
            >
                ${resetUrl}
            </p>

            <p style="margin-top: 30px;">
                Best regards,<br />
                <strong>Canada RN Mentorship</strong>
            </p>

        </div>
    `;

    return sendEmail({
        to,
        subject:
            "Reset Your Canada RN Mentorship Password",
        html,
    });
};