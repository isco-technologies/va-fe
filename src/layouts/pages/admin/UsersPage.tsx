/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import AppLayout from "../../appLayout";
import Pagination from "../../../components/Pagination";
import UserForm from "../../../components/UserForm";
import { useAppDispatch } from "../../../feature/hooks/useAppDispatch";
import { useAppSelector } from "../../../feature/hooks/useAppSelector";
import {fetchUsers,addUser,updateUser,deleteUser,} from "../../../feature/users/userSlice";
import { fetchCompanies } from "../../../feature/company/companySlice";
import type { User as UserType, UserRole } from "../../../types";

// HELPERS 

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  CLIENT:      "bg-gray-100 text-gray-600 border border-gray-200",
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CLIENT:      "Client",
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        ROLE_STYLES[role] ?? "bg-gray-100 text-gray-600 border border-gray-200"
      }`}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-medium text-indigo-600">{initials}</span>
    </div>
  );
}

//  COMPONENT 

export default function UsersPage() {
  const dispatch = useAppDispatch();

  const usersState = useAppSelector((state) => state.users);
  const users = usersState?.users ?? [];
  const loading = usersState?.isLoading ?? false;
  const pagination = usersState?.pagination ?? {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  };

  const companiesState = useAppSelector((state) => state.companies);
  const companies = companiesState?.companies ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, limit: 20 }));
    dispatch(fetchCompanies());
  }, [dispatch, currentPage]);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    role: UserRole;
    companyId?: string;
  }) => {
    try {
      if (editingUser) {
        await dispatch(updateUser({ id: editingUser.id, data })).unwrap();
        toast.success("User updated");
      } else {
        await dispatch(addUser(data)).unwrap();
        toast.success("User created");
      }
      await dispatch(fetchUsers({ page: currentPage, limit: 20 })).unwrap();
      setShowForm(false);
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err?.message || err || "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success("User deleted");
      await dispatch(fetchUsers({ page: currentPage, limit: 20 })).unwrap();
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.company?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-5">

        {/* PAGE HEADER */}
        <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage platform users and their roles
            </p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search users, emails or companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  User
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Company
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Email
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-gray-400">
                    Loading users…
                  </td>
                </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              )}

              {!loading &&
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name ?? "?"} />
                        <span className="font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5 text-gray-600">
                      {user.company?.name ?? (
                        <span className="text-gray-400 italic">No company</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-gray-500">{user.email}</td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowForm(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit user"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Table footer with count */}
          {!loading && filteredUsers.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                Showing {filteredUsers.length} of {pagination.total} users
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onChange={setCurrentPage}
        />
      </div>

      {/* FORM MODAL */}
      <UserForm
        user={editingUser || undefined}
        companies={companies}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingUser(null);
        }}
        onSubmit={handleSubmit}
      />
    </AppLayout>
  );
}