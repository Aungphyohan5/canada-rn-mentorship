import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

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
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">

                <h2>
                    Your Mentorship Session is Confirmed 🎉
                </h2>

                <p>
                    Hi ${firstName || "there"},
                </p>

                <p>
                    Your <strong>Canada RN Mentorship Session</strong>
                    has been successfully scheduled.
                </p>

                <div style="padding: 20px; background: #f7f7f7; border-radius: 10px;">

                    <p>
                        <strong>Date & Time</strong><br>
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
                                            color:white;
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
                                    Your Zoom meeting link will be
                                    provided shortly.
                                </p>
                            `
            }

                </div>

                <p>
                    Please save this appointment to your calendar.
                </p>

                <p>
                    I look forward to speaking with you.
                </p>

                <p>
                    Best regards,<br>
                    <strong>Tin Zar</strong><br>
                    Canada RN Mentorship
                </p>

            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendPaymentReceivedEmail = async ({
    to,
    firstName,
    amount,
    currency,
    sessionType,
}) => {
    const formattedAmount = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: currency || "CAD",
    }).format(amount || 0);

    const mailOptions = {
        from: `"Canada RN Mentorship By Tin Zar" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Payment Received — Canada RN Mentorship",

        text: `
Hi ${firstName || "there"},

Thank you for your payment for Canada RN Mentorship.

Payment received successfully.

Service:
${sessionType || "Canada RN Mentorship Session"}

Amount:
${formattedAmount}

Payment Status:
Paid

Your payment has been successfully received.

Next Step:
You can now schedule your mentorship session through the scheduling link provided in your Canada RN Mentorship dashboard.

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
            line-height:1.3;
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
            margin:0 0 20px;
        ">
            Hi ${firstName || "there"},
        </p>

        <p style="
            font-size:15px;
            line-height:1.7;
            color:#5c6b7d;
        ">
            Thank you for your payment. Your payment for
            <strong>${sessionType || "Canada RN Mentorship Session"}</strong>
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
                ${sessionType || "Canada RN Mentorship Session"}
            </p>

            <p style="margin:0 0 14px;">
                <strong>Amount Paid</strong><br>
                ${formattedAmount}
            </p>

            <p style="margin:0;">
                <strong>Payment Status</strong><br>
                <span style="color:#198754; font-weight:700;">
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
            We look forward to speaking with you!
        </p>

        <p style="
            margin-top:28px;
            line-height:1.6;
        ">
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

    await transporter.sendMail(mailOptions);
};