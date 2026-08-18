import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import BookingSuccess from "./pages/BookingSuccess";
import BookSession from "./pages/BookSession";
import BookingCancelled from "./pages/BookingCancelled.jsx";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

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
        path="/book-session"
        element={
          <ProtectedRoute>
            <BookSession />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking/success"
        element={<BookingSuccess />}
      />

      <Route
        path="/booking/cancelled"
        element={<BookingCancelled />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;