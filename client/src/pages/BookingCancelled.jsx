import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const BookingCancelled = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cancelBooking = async () => {
            const bookingId =
                searchParams.get("booking_id");

            if (!bookingId) {
                setLoading(false);
                return;
            }

            try {
                await api.post(
                    "/payments/cancel-booking",
                    {
                        bookingId,
                    }
                );
            } catch (error) {
                console.error(
                    "CANCEL BOOKING ERROR:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        cancelBooking();
    }, [searchParams]);

    return (
        <div className="booking-result-page">
            <div className="booking-result-card">

                <div className="result-icon cancelled">
                    ×
                </div>

                <p className="card-eyebrow">
                    PAYMENT NOT COMPLETED
                </p>

                <h1>
                    Payment Cancelled
                </h1>

                <p className="result-message">
                    No payment was taken.
                    Your mentorship session has not
                    been confirmed.
                </p>

                <p className="result-submessage">
                    You can return to your dashboard and
                    try again whenever you're ready.
                </p>

                {!loading && (
                    <div className="result-actions">

                        <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Return to Dashboard
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate("/book-session")
                            }
                        >
                            Try Again
                        </button>

                    </div>
                )}

            </div>
        </div>
    );
};

export default BookingCancelled;