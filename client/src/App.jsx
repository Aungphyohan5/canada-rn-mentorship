import {
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import BookingSuccess from "./pages/BookingSuccess";
import BookSession from "./pages/BookSession";
import BookingCancelled from "./pages/BookingCancelled.jsx";
import Resources from "./pages/Resources.jsx";
import Bookings from "./pages/Bookings.jsx";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNurseProfile from "./pages/AdminNurseProfile";


function App() {
  return (
    <Routes>

      {/* ==========================================
                PUBLIC
            ========================================== */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* ==========================================
                NURSE ONBOARDING
            ========================================== */}

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />


      {/* ==========================================
                NURSE DASHBOARD
            ========================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/book-session"
        element={
          <ProtectedRoute>
            <BookSession />
          </ProtectedRoute>
        }
      />


      {/* ==========================================
                STRIPE
            ========================================== */}

      <Route
        path="/booking/success"
        element={<BookingSuccess />}
      />

      <Route
        path="/booking/cancelled"
        element={<BookingCancelled />}
      />


      {/* ==========================================
                ADMIN
            ========================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/nurses/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminNurseProfile />
          </ProtectedRoute>
        }
      />


      {/* ==========================================
                UNKNOWN ROUTE
            ========================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;