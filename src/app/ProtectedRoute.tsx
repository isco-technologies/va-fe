import { Navigate, Outlet } from "react-router-dom";

type Props = {
  isAuthenticated: boolean;
  role?: string;
  allowedRoles?: string[];
};

export default function ProtectedRoute({
  isAuthenticated,
  role,
  allowedRoles,
}: Props) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/landingPage" replace />;
  }

  return <Outlet />;
}