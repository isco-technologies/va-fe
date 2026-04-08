import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../feature/store/authStore";

type Props = {
  allowedRoles?: string[];
};

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { token, user } = useAuthStore();

  const isAuthenticated = !!token;
  const role = user?.role;

  if (!isAuthenticated) {
    return <Navigate to="/landingPage" replace />;
  }
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}