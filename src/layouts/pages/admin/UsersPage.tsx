import { useEffect, useState } from "react";
import { User, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import AppLayout from "../../appLayout";
import Pagination from "../../../components/Pagination";
import UserForm from "../../../components/UserForm";
import { useAppDispatch } from "../../../feature/hooks/useAppDispatch";
import { useAppSelector } from "../../../feature/hooks/useAppSelector";
import {fetchUsers,addUser,updateUser,deleteUser,} from "../../../feature/users/userSlice";
import { fetchCompanies } from "../../../feature/company/companySlice";
import type { User as UserType, UserRole } from "../../../types";

export default function UsersPage() {
  const dispatch = useAppDispatch();

  const usersState = useAppSelector((state) => state.users);
  const users = usersState?.users ?? [];
  const loading = usersState?.isLoading ?? false;

  const pagination =
    usersState?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 };

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

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span className="text-indigo-600 font-semibold">Super Admin</span>
        );
      case "ADMIN":
        return <span className="text-green-600 font-semibold">Admin</span>;
      case "AUDITOR":
        return <span className="text-yellow-600 font-semibold">Auditor</span>;
      default:
        return <span className="text-gray-600 font-semibold">Client</span>;
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <User className="h-7 w-7 text-indigo-600 mr-3" />
          <h1 className="text-xl font-bold">Users</h1>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users, emails or companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border rounded-md px-4 py-2"
        />
      </div>

      <div className="bg-white shadow rounded-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Company</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  Loading users...
                </td>
              </tr>
            )}

            {!loading &&
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">
                    {user.company ? user.company.name : "No Company"}
                  
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-indigo-600 hover:text-indigo-800 mr-4"
                      onClick={() => {
                        setEditingUser(user);
                        setShowForm(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onChange={setCurrentPage}
        />
      </div>

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