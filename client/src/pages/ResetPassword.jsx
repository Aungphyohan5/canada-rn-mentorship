import { useState } from "react";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import api from "../services/api";

import "./Login.css";

const ResetPassword = () => {
    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();

    const token =
        searchParams.get("token");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!token) {
            setError(
                "This password reset link is invalid."
            );

            return;
        }

        if (password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );

            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );

            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/reset-password",
                {
                    token,
                    password,
                }
            );

            setMessage(
                response.data.message ||
                "Your password has been reset successfully."
            );

            setPassword("");
            setConfirmPassword("");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                });
            }, 2000);

        } catch (error) {
            console.error(
                "RESET PASSWORD ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to reset your password. Please request a new reset link."
            );

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-page">

            <div className="login-container">

                {/* BRAND */}

                <div className="login-brand">

                    <div className="login-brand-logo">

                        <div className="login-logo-mark">
                            🍁
                        </div>

                        <div className="login-brand-text">

                            <strong>
                                Canada RN
                            </strong>

                            <span>
                                Mentorship
                            </span>

                        </div>

                    </div>

                </div>


                {/* CARD */}

                <div className="login-card">

                    <div className="login-header">

                        <p className="login-eyebrow">
                            ACCOUNT SECURITY
                        </p>

                        <h1>
                            Reset Password
                        </h1>

                        <p>
                            Create a new password for
                            your Canada RN Mentorship account.
                        </p>

                    </div>


                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

                        {/* PASSWORD */}

                        <div className="login-form-group">

                            <label htmlFor="password">
                                New Password
                            </label>

                            <div className="login-input-wrapper">

                                <input
                                    id="password"
                                    className="login-input login-password-input"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    disabled={loading}
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="login-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <div className="login-input-wrapper">

                                <input
                                    id="confirmPassword"
                                    className="login-input login-password-input"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    disabled={loading}
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {error && (
                            <div
                                className="login-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}


                        {message && (
                            <div
                                className="login-success"
                                role="status"
                            >
                                {message}
                            </div>
                        )}


                        <button
                            type="submit"
                            className="login-submit"
                            disabled={
                                loading ||
                                !token
                            }
                        >
                            {loading
                                ? "Resetting..."
                                : "Reset Password"}
                        </button>

                    </form>


                    <p className="login-register">

                        Remember your password?{" "}

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Back to Log In
                        </button>

                    </p>

                </div>


                <button
                    type="button"
                    className="login-back-home"
                    disabled={loading}
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← Back to Home
                </button>


                <div className="login-footer">
                    © 2026 Canada RN Mentorship
                </div>

            </div>

        </div>
    );
};

export default ResetPassword;