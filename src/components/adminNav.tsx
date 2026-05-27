import { NavLink } from "react-router-dom";

const AdminNav = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex gap-6">
        <NavLink
          to="/admin/companies"
          className={({ isActive }) =>
            isActive ? "text-indigo-600 font-semibold" : "text-gray-600"
          }
        >
          Companies
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? "text-indigo-600 font-semibold" : "text-gray-600"
          }
        >
          Users
        </NavLink>

        <NavLink
          to="/admin/assessments"
          className={({ isActive }) =>
            isActive ? "text-indigo-600 font-semibold" : "text-gray-600"
          }
        >
          Assessments
        </NavLink>
      </div>
    </nav>
  );
};

export default AdminNav;
