import nodemailer from "nodemailer";
import {
    sendMentorshipConfirmationEmail,
} from "../services/emailService.js";

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