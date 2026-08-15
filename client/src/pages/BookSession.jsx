import { useState } from "react";
import api from "../services/api";

const BookSession = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleBookSession = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.post(
                "/payments/create-checkout-session"
            );

            const checkoutUrl =
                response.data.data.checkoutUrl;

            if (!checkoutUrl) {
                throw new Error(
                    "Stripe checkout URL was not returned."
                );
            }

            window.location.href = checkoutUrl;
        } catch (error) {
            console.error(
                "BOOK SESSION ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to start booking."
            );

            setLoading(false);
        }
    };

    return (
        <div className="booking-page">
            <div className="booking-card">

                <p className="card-eyebrow">
                    ONE-ON-ONE MENTORSHIP
                </p>

                <h1>
                    Canada RN Mentorship Session
                </h1>

                <p className="booking-description">
                    Get personalized guidance on your
                    Canadian RN pathway, registration
                    requirements, and immigration options
                    for internationally educated nurses.
                </p>

                <div className="booking-details">
                    <div>
                        <span>Session</span>
                        <strong>45 minutes</strong>
                    </div>

                    <div>
                        <span>Investment</span>
                        <strong>CA$125 CAD</strong>
                    </div>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={handleBookSession}
                    disabled={loading}
                >
                    {loading
                        ? "Opening Checkout..."
                        : "Continue to Payment"}
                </button>

                {error && (
                    <p className="booking-error">
                        {error}
                    </p>
                )}

                <p className="booking-note">
                    After successful payment, you'll be
                    able to continue to scheduling.
                </p>

            </div>
        </div>
    );
};

export default BookSession;