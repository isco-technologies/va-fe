import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {Building2,ClipboardList,LogOut,LayoutDashboard,ListTodo,FileDown,CircleArrowOutDownRight,User2Icon,ShieldAlert,} from "lucide-react";
import { useAuthStore } from "../feature/store/authStore";

const navStyle = ({ isActive }: any) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
    isActive
      ? "bg-slate-800 text-white"
      : "text-slate-300 hover:bg-slate-800"
  }`;

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [showUserInfo, setShowUserInfo] = useState(false);

  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col">

      {/* ================= LOGO ================= */}
      <div className="px-6 py-5 text-xl font-bold text-indigo-200 border-b border-slate-800 flex items-center gap-2">
        <ShieldAlert className="h-6 w-6" />
        VA Platform
      </div>

      {/* ================= NAV ================= */}
      <nav className="flex-1 px-3 space-y-1">

        {/* ADMIN */}
        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <>
            <NavLink to="/admin/dashboard" className={navStyle}>
              <LayoutDashboard /> Dashboard
            </NavLink>

            <NavLink to="/admin/assessment" className={navStyle}>
              <ClipboardList /> Assessments & Reviews 
            </NavLink>

            <NavLink to="/admin/companies" className={navStyle}>
              <Building2 /> Companies
            </NavLink>

            <NavLink to="/admin/checklists" className={navStyle}>
              <ListTodo /> Checklists
            </NavLink>

            <NavLink to="/admin/users" className={navStyle}>
              <User2Icon /> Users
            </NavLink>

            <NavLink to="/admin/findings" className={navStyle}>
              <CircleArrowOutDownRight /> Findings
            </NavLink>
          </>
        )}

        {/* CLIENT */}
        {role === "CLIENT" && (
          <>
            <NavLink to="/client/dashboard" className={navStyle}>
              <LayoutDashboard /> Dashboard
            </NavLink>

            <NavLink to="/client/assessment" className={navStyle}>
              <ClipboardList /> Assessment
            </NavLink>

            <NavLink to="/client/reports" className={navStyle}>
              <FileDown /> Reports
            </NavLink>
          </>
        )}
      </nav>

      {/* ================= USER PROFILE ================= */}
      {user && (
        <div className="border-t border-slate-800 p-4">
          <div className="relative">

            {/* BUTTON */}
            <button
              onClick={() => setShowUserInfo(!showUserInfo)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800"
            >
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center">
                {user.name?.[0]}
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">
                  {user.role}
                </p>
              </div>

              {showUserInfo }
            </button>

            {/* DROPDOWN */}
            {showUserInfo && (
              <div className="absolute bottom-14 left-0 w-full bg-slate-800 rounded-md shadow-lg border border-slate-700 z-50">

                {/* USER INFO */}
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">
                    {user.email}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {user.role.replace("_", " ")}
                  </p>
                </div>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;