
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ParentDashboard from "./pages/ParentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateConsentForm from "./pages/CreateConsentForm";
import TeacherConsentForms from "./pages/TeacherConsentForms";
import ParentConsentForms from "./pages/ParentConsentForms";
import ParentConsentDetails from "./pages/ParentConsentDetails";
import TeacherResponses from "./pages/TeacherResponses";
import TeacherResponseDetails from "./pages/TeacherResponseDetails";
import UserManagement from "./pages/UserManagement";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Parent Routes */}
      <Route
        path="/parent-dashboard"
        element={
          <ProtectedRoute allowedRoles={["parent"]}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/parent-consent-forms"
        element={
          <ProtectedRoute allowedRoles={["parent"]}>
            <ParentConsentForms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/parent-consent-form/:id"
        element={
          <ProtectedRoute allowedRoles={["parent"]}>
            <ParentConsentDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/parent-announcements"
        element={
          <ProtectedRoute allowedRoles={["parent"]}>
            <h1>School Announcements - Coming Soon</h1>
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher-create-form"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <CreateConsentForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher-consent-forms"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherConsentForms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher-responses"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherResponses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher-response/:id"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherResponseDetails />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={<h1>404 - Page Not Found</h1>}
      />
    </Routes>
  );
}

export default App;
