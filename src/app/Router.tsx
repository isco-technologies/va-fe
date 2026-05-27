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
import LandingPage from "../layouts/pages/admin/LandingPage";
import AdminAssessmentReviewPage from "../layouts/pages/admin/AdminAssessmentReview"; 
import AdminReportPage from "../layouts/pages/admin/AdminReportPage";
import AssessmentReportPage from "../layouts/pages/admin/AssessmentReportPage";
import AdminDashboard from "../layouts/pages/admin/AdminDashboardPage";
import ClientReportsPage from "../layouts/pages/client/ClientReportPage";
import ReportListPage from "../layouts/pages/admin/ReportfListPage";
import ClientReportViewPage from "../layouts/pages/client/ClientReportViewPage";
import ClientPolicyPage from "../layouts/pages/client/ClientPolicyPage";
import ClientDashboard from "../layouts/pages/client/ClientDashboard";
import ArchivesPage from "../layouts/pages/admin/ArchivesPage";

// AUTH HELPER
const getAuth = () => {
  const state = useAuthStore.getState();
  return {
    isAuthenticated: !!state.token,
    role: state.user?.role,
  };
};

const router = createBrowserRouter([
  //PUBLIC 
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/set-password", element: <SetPasswordPage /> },
  { path: "/unauthorized", element: <div>Unauthorized</div> },

  //  ADMIN 
  {
    path: "/admin",
    element: (
      <ProtectedRoute
        {...getAuth()}
        allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      />
    ),
    children: [
      // 
      { index: true, element: <Navigate to="dashboard" replace /> },

      { path: "assessment", element: <AssessmentPage /> },
      { path: "companies", element: <CompanyPage /> },
      { path: "checklists", element: <ChecklistPage /> },
      { path: "archives", element: <ArchivesPage /> },
      { path: "reports", element: <AdminReportPage /> },
      
      { path: "reports/edit/:assessmentId", element: <ReportListPage /> },
      { path: "reports/view/:findingId", element: <AssessmentReportPage /> },
      {path: "dashboard", element: <AdminDashboard />}, 
      
      // DETAILS
      {
        path: "checklists/:checklistId/domains",
        element: <ChecklistDomainPage />,
      },
      {
        path: "assessments/:assessmentId/review",
        element: <AdminAssessmentReviewPage />,
      },
      { path: "users", element: <UsersPage /> },
    ],
  },

  // CLIENT 
  {
    path: "/client",element: (<ProtectedRoute{...getAuth()}
        allowedRoles={["CLIENT"]}
      />
    ),
    children: [
      
      { index: true, element: <Navigate to="assessment" replace /> },
      { path: "assessment", element: <ClientAssessmentPage /> },
      { path: "assessment/:id", element: <ClientAssessmentPage /> },
      { path: "reports", element: <ClientReportsPage /> },
      { path: "reports/:findingId", element: <ClientReportViewPage /> },
      { path: "consent", element: <ClientPolicyPage /> },
      { path: "dashboard", element: <ClientDashboard /> },
    ],
  },

  // FALLBACK 
  {
    path: "*",
    element: (() => {
      const { isAuthenticated, role } = getAuth();

      if (!isAuthenticated) return <Navigate to="/login" replace />;

      return role === "CLIENT"
        ? <Navigate to="/client/dashboard" replace />
        : <Navigate to="/admin/dashboard" replace />;
    })(),
  },
]);

export default router;