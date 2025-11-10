// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("userInfo");

  if (!user) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
