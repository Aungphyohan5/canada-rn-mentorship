import { useSearchParams } from "react-router-dom";

const CALENDLY_URL =
    "https://calendly.com/canadarnmentorshipbytz/canada-rn-mentorship";

const BookingSuccess = () => {
    const [searchParams] = useSearchParams();

    const sessionId = searchParams.get("session_id");

    const handleSchedule = () => {
        window.location.href = CALENDLY_URL;
    };

    return (
        <div className="booking-page">
            <div className="booking-card">

                <div className="success-icon">
                    ✓
                </div>

                <p className="card-eyebrow">
                    PAYMENT CONFIRMED
                </p>

                <h1>
                    Payment Successful 🎉
                </h1>

                <p className="booking-description">
                    Thank you for booking your
                    Canada RN Mentorship Session.
                </p>

                <div className="success-details">
                    <div>
                        <span>Session</span>
                        <strong>
                            Canada RN Mentorship
                        </strong>
                    </div>

                    <div>
                        <span>Duration</span>
                        <strong>
                            45 minutes
                        </strong>
                    </div>

                    <div>
                        <span>Payment</span>
                        <strong>
                            CA$125 CAD
                        </strong>
                    </div>
                </div>

                <p className="booking-description">
                    Your payment has been received.
                    Please choose a convenient date and
                    time for your mentorship session.
                </p>

                <button
                    type="button"
                    className="primary-button"
                    onClick={handleSchedule}
                >
                    Continue to Schedule →
                </button>

                <p className="booking-note">
                    You'll be taken to the scheduling
                    page to choose your 45-minute session.
                </p>

                {sessionId && (
                    <p className="session-reference">
                        Payment confirmed
                    </p>
                )}

            </div>
        </div>
    );
};

export default BookingSuccess;