import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({
  children,
  allowedRoles,
}) => {
  const {
    user,
    token,
    loading,
  } = useAuth();

  const location = useLocation();


  // =========================================================
  // AUTHENTICATION LOADING
  // =========================================================

  if (loading) {
    return <p>Loading...</p>;
  }


  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }


  // =========================================================
  // ROLE CHECK
  // =========================================================

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  // =========================================================
  // AUTHORIZED
  // =========================================================

  return children;
};

export default ProtectedRoute;