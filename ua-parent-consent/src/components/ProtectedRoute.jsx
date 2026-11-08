
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const savedUser = localStorage.getItem("loggedInUser");

  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("loggedInUser");
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.role) {
    localStorage.removeItem("loggedInUser");
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role.toLowerCase())
  ) {
    switch (user.role.toLowerCase()) {
      case "parent":
        return <Navigate to="/parent-dashboard" replace />;

      case "teacher":
        return <Navigate to="/teacher-dashboard" replace />;

      case "admin":
        return <Navigate to="/admin-dashboard" replace />;

      default:
        localStorage.removeItem("loggedInUser");
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
