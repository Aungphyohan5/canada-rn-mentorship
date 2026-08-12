import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Welcome to Canada RN Mentorship</h1>

            {user && (
                <>
                    <h2>
                        Hello {user.firstName} {user.lastName}
                    </h2>

                    <p>Email: {user.email}</p>

                    <p>Role: {user.role}</p>
                </>
            )}

            <button onClick={logout}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;