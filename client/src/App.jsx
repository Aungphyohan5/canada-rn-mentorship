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


function App() {

  return (

    <Routes>

      {/* ==========================================
                PUBLIC LANDING PAGE
            ========================================== */}

      <Route
        path="/"
        element={
          <LandingPage />
        }
      />


      {/* ==========================================
                LOGIN
            ========================================== */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      {/* ==========================================
    REGISTER
========================================== */}

      <Route
        path="/register"
        element={<Register />}
      />


      {/* ==========================================
                PROTECTED DASHBOARD
            ========================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />


      {/* ==========================================
                PROFILE
            ========================================== */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />


      {/* ==========================================
                RESOURCES
            ========================================== */}

      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        }
      />


      {/* ==========================================
                BOOKINGS
            ========================================== */}

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />


      {/* ==========================================
                BOOK MENTORSHIP SESSION
            ========================================== */}

      <Route
        path="/book-session"
        element={
          <ProtectedRoute>
            <BookSession />
          </ProtectedRoute>
        }
      />


      {/* ==========================================
                STRIPE SUCCESS
            ========================================== */}

      <Route
        path="/booking/success"
        element={
          <BookingSuccess />
        }
      />


      {/* ==========================================
                STRIPE CANCELLED
            ========================================== */}

      <Route
        path="/booking/cancelled"
        element={
          <BookingCancelled />
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