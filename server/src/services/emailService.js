import nodemailer from "nodemailer";


// ============================================================
// EMAIL TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },

    // Prefer IPv4 because Render reported an IPv6 connection error
    family: 4,

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});


// ============================================================
// COMMON EMAIL SENDER
// ============================================================

const sendEmail = async (mailOptions) => {
    if (!process.env.EMAIL_USER) {
        throw new Error("EMAIL_USER is not configured.");
    }

    if (!process.env.EMAIL_APP_PASSWORD) {
        throw new Error("EMAIL_APP_PASSWORD is not configured.");
    }

    try {
        const info = await transporter.sendMail(mailOptions);

        console.log(
            "📧 Email sent successfully:",
            info.messageId
        );

        return info;

    } catch (error) {
        console.error(
            "❌ Email sending failed:",
            error.message
        );

        throw error;
    }
};


// ============================================================
// MENTORSHIP SCHEDULING CONFIRMATION EMAIL
// ============================================================

export const sendMentorshipConfirmationEmail = async ({
    to,
    firstName,
    scheduledAt,
    zoomJoinUrl,
}) => {
    const formattedDate = new Date(
        scheduledAt
    ).toLocaleString("en-CA", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "America/Halifax",
    });

    const mailOptions = {
        from: `"Canada RN Mentorship By Tin Zar" <${process.env.EMAIL_USER}>`,
        to,

        subject:
            "Your Canada RN Mentorship Session is Confirmed",

        text: `
Hi ${firstName || "there"},

Your Canada RN Mentorship Session has been successfully scheduled.

Date & Time:
${formattedDate}

Duration:
45 minutes

Zoom Meeting:
${zoomJoinUrl || "The Zoom link will be provided shortly."}

Please save this appointment to your calendar.

I look forward to speaking with you.

Best regards,
Tin Zar
Canada RN Mentorship
        `,

        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="
    margin:0;
    padding:0;
    background:#f4f7fa;
    font-family:Arial, Helvetica, sans-serif;
    color:#24344d;
">

<div style="
    max-width:600px;
    margin:40px auto;
    background:#ffffff;
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 8px 30px rgba(16,42,76,0.08);
">

    <div style="
        background:#102a4c;
        padding:28px 32px;
        text-align:center;
    ">
        <h1 style="
            margin:0;
            color:#ffffff;
            font-size:24px;
        ">
            Canada RN Mentorship
        </h1>

        <p style="
            margin:8px 0 0;
            color:#dbe8f2;
            font-size:14px;
        ">
            Session Confirmation
        </p>
    </div>

    <div style="padding:32px;">

        <h2 style="
            margin:0 0 16px;
            color:#102a4c;
            font-size:22px;
        ">
            Your Mentorship Session is Confirmed 🎉
        </h2>

        <p style="font-size:16px; line-height:1.7;">
            Hi ${firstName || "there"},
        </p>

        <p style="
            font-size:15px;
            line-height:1.7;
            color:#5c6b7d;
        ">
            Your <strong>Canada RN Mentorship Session</strong>
            has been successfully scheduled.
        </p>

        <div style="
            padding:20px;
            background:#f7fafc;
            border:1px solid #e3ebf2;
            border-radius:12px;
        ">

            <p>
                <strong>Date &amp; Time</strong><br>
                ${formattedDate}
            </p>

            <p>
                <strong>Duration</strong><br>
                45 minutes
            </p>

            ${zoomJoinUrl
                ? `
            <p>
                <strong>Zoom Meeting</strong><br><br>

                <a
                    href="${zoomJoinUrl}"
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#2563eb;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:6px;
                    "
                >
                    Join Zoom Meeting
                </a>
            </p>
                    `
                : `
            <p>
                Your Zoom meeting link will be provided shortly.
            </p>
                    `
            }

        </div>

        <p style="
            font-size:15px;
            line-height:1.7;
            color:#5c6b7d;
        ">
            Please save this appointment to your calendar.
        </p>

        <p style="
            font-size:15px;
            line-height:1.7;
            color:#5c6b7d;
        ">
            I look forward to speaking with you.
        </p>

        <p style="line-height:1.6;">
            Best regards,<br>
            <strong>Tin Zar</strong><br>
            Canada RN Mentorship
        </p>

    </div>
</div>

</body>
</html>
        `,
    };

    return sendEmail(mailOptions);
};


// ============================================================
// PAYMENT RECEIVED EMAIL
// ============================================================

export const sendPaymentReceivedEmail = async ({
    to,
    firstName,
    amount,
    currency,
    sessionType,
}) => {
    const formattedAmount = new Intl.NumberFormat(
        "en-CA",
        {
            style: "currency",
            currency: currency || "CAD",
        }
    ).format(amount || 0);

    const serviceName =
        sessionType || "Canada RN Mentorship Session";

    const mailOptions = {
        from: `"Canada RN Mentorship By Tin Zar" <${process.env.EMAIL_USER}>`,
        to,

        subject:
            "Payment Received — Canada RN Mentorship",

        text: `
Hi ${firstName || "there"},

Thank you for your payment for Canada RN Mentorship.

Your payment has been successfully received.

Service:
${serviceName}

Amount:
${formattedAmount}

Payment Status:
Paid

Next Step:
You can now schedule your mentorship session through your Canada RN Mentorship dashboard.

We look forward to meeting with you.

Best regards,

Tin Zar
Canada RN Mentorship
        `,

        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="
    margin:0;
    padding:0;
    background:#f4f7fa;
    font-family:Arial, Helvetica, sans-serif;
    color:#24344d;
">

<div style="
    max-width:600px;
    margin:40px auto;
    background:#ffffff;
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 8px 30px rgba(16,42,76,0.08);
">

    <div style="
        background:#102a4c;
        padding:28px 32px;
        text-align:center;
    ">
        <h1 style="
            margin:0;
            color:#ffffff;
            font-size:24px;
        ">
            Canada RN Mentorship
        </h1>

        <p style="
            margin:8px 0 0;
            color:#dbe8f2;
            font-size:14px;
        ">
            Payment Confirmation
        </p>
    </div>

    <div style="padding:32px;">

        <h2 style="
            margin:0 0 16px;
            color:#102a4c;
            font-size:22px;
        ">
            Payment Received ✓
        </h2>

        <p style="
            font-size:16px;
            line-height:1.7;
        ">
            Hi ${firstName || "there"},
        </p>

        <p style="
            font-size:15px;
            line-height:1.7;
            color:#5c6b7d;
        ">
            Thank you for your payment. Your payment for
            <strong>${serviceName}</strong>
            has been successfully received.
        </p>

        <div style="
            margin:24px 0;
            padding:22px;
            background:#f7fafc;
            border:1px solid #e3ebf2;
            border-radius:12px;
        ">

            <p style="margin:0 0 14px;">
                <strong>Service</strong><br>
                ${serviceName}
            </p>

            <p style="margin:0 0 14px;">
                <strong>Amount Paid</strong><br>
                ${formattedAmount}
            </p>

            <p style="margin:0;">
                <strong>Payment Status</strong><br>
                <span style="
                    color:#198754;
                    font-weight:700;
                ">
                    Paid
                </span>
            </p>

        </div>

        <div style="
            margin:24px 0;
            padding:20px;
            background:#eef6fb;
            border-radius:12px;
        ">

            <h3 style="
                margin:0 0 8px;
                color:#102a4c;
                font-size:17px;
            ">
                Next Step
            </h3>

            <p style="
                margin:0;
                color:#5c6b7d;
                line-height:1.6;
                font-size:14px;
            ">
                You can now schedule your mentorship session
                through your Canada RN Mentorship dashboard.
            </p>

        </div>

        <p style="
            font-size:15px;
            line-height:1.7;
            color:#5c6b7d;
        ">
            We look forward to meeting with you!
        </p>

        <p style="line-height:1.6;">
            Best regards,<br>
            <strong>Tin Zar</strong><br>
            Canada RN Mentorship
        </p>

    </div>
</div>

</body>
</html>
        `,
    };

    return sendEmail(mailOptions);
};