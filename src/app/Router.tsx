import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../auth/Login";
import CompanyPage from "../layouts/pages/admin/CompanyPage";
import ChecklistPage from "../layouts/pages/admin/ChecklistPage";
import ChecklistDomainPage from "../layouts/pages/admin/ChecklistDomainPage";
import UsersPage from "../layouts/pages/admin/UsersPage";
import AssessmentPage from "../layouts/pages/admin/AssessmentPage";
import ClientAssessmentPage from "../layouts/pages/client/ClientAssessmentPage";
import { useAuthStore } from "../feature/store/authStore";
import SetPasswordPage from "../layouts/pages/client/SetPasswordPage";

const getAuth = () => {
  const state = useAuthStore.getState();
  return {
    isAuthenticated: !!state.token,
    role: state.user?.role,
  };
};

const router = createBrowserRouter([
  // PUBLIC
  { path: "/login", element: <Login /> },
  { path: "/set-password", element: <SetPasswordPage /> },
  { path: "/unauthorized", element: <div>Unauthorized</div> },

  // ADMIN 
  {
    path: "/admin",
    element: (
      <ProtectedRoute
        {...getAuth()}
        allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      />
    ),
    children: [
      { path: "assessment", element: <AssessmentPage /> },
      { path: "companies", element: <CompanyPage /> },

      // LIST
      { path: "checklists", element: <ChecklistPage /> },

      // DETAILS
      {
        path: "checklists/:checklistId/domains",
        element: <ChecklistDomainPage />,
      },

      { path: "users", element: <UsersPage /> },
    ],
  },

  //CLIENT 
  {
    path: "/client",
    element: (
      <ProtectedRoute
        {...getAuth()}
        allowedRoles={["CLIENT"]}
      />
    ),
    children: [
      { path: "assessment", element: <ClientAssessmentPage /> },
    ],
  },

  //  DEFAULT 
  {
    path: "*",
    element: (() => {
      const { isAuthenticated, role } = getAuth();

      if (!isAuthenticated) return <Navigate to="/login" />;

      return role === "CLIENT"
        ? <Navigate to="/client/assessment" />
        : <Navigate to="/admin/assessment" />;
    })(),
  },
]);

export default router;