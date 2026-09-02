import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "./AdminDashboard.css";


const AdminDashboard = () => {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================================================
    // LOAD CUSTOMERS
    // =========================================================

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/admin/nurses"
                );

                setCustomers(
                    response.data?.data?.customers || []
                );

            } catch (error) {
                console.error(
                    "ADMIN CUSTOMER LOAD ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load customers."
                );

            } finally {
                setLoading(false);
            }
        };

        loadCustomers();

    }, []);


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="admin-page">

            <header className="admin-header">

                <div>
                    <p className="admin-eyebrow">
                        ADMIN PANEL
                    </p>

                    <h1>
                        Nurse Customers
                    </h1>

                    <p>
                        View customer accounts and
                        onboarding information.
                    </p>
                </div>

                <div className="admin-count">
                    {customers.length}
                    <span>
                        Customers
                    </span>
                </div>

            </header>


            <main className="admin-container">

                {loading && (
                    <div className="admin-state">
                        Loading customers...
                    </div>
                )}


                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}


                {!loading &&
                    !error &&
                    customers.length === 0 && (

                        <div className="admin-state">
                            No nurse customers found.
                        </div>

                    )}


                {!loading &&
                    !error &&
                    customers.length > 0 && (

                        <div className="customer-table-wrapper">

                            <table className="customer-table">

                                <thead>

                                    <tr>
                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Residence
                                        </th>

                                        <th>
                                            License
                                        </th>

                                        <th>
                                            NCLEX
                                        </th>

                                        <th>
                                            Province
                                        </th>

                                        <th>
                                            Profile
                                        </th>

                                        <th>
                                        </th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {customers.map(
                                        ({ user, profile }) => (

                                            <tr
                                                key={user._id}
                                            >

                                                <td>

                                                    <div className="customer-name">

                                                        <strong>
                                                            {user.firstName}{" "}
                                                            {user.lastName}
                                                        </strong>

                                                        <span>
                                                            {user.email}
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>
                                                    {profile?.countryOfResidence ||
                                                        "—"}
                                                </td>


                                                <td>
                                                    {profile?.licenseStatus ||
                                                        "—"}
                                                </td>


                                                <td>
                                                    {profile?.nclexStatus ||
                                                        "—"}
                                                </td>


                                                <td>
                                                    {profile?.preferredProvince ||
                                                        "—"}
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            profile?.profileCompleted
                                                                ? "status-complete"
                                                                : "status-incomplete"
                                                        }
                                                    >
                                                        {profile?.profileCompleted
                                                            ? "Complete"
                                                            : "Incomplete"}
                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        className="view-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/nurses/${user._id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

            </main>

        </div>
    );
};


export default AdminDashboard;