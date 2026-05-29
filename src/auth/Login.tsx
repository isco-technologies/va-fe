import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../feature/store/authStore";
import { ROUTES } from "../constants/routes";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuthStore();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  //  If redirected from protected route
  const from =
    (location.state as { from?: Location })?.from?.pathname;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(
        credentials.email,
        credentials.password
      );

      if (success) {
        const { user } = useAuthStore.getState(); 

        // 1. If coming from protected route → go back
        if (from) {
          navigate(from, { replace: true });
          return;
        }

        //  2. Otherwise → role-based redirect
        if (user?.role === "CLIENT") {
         const hasConsented = localStorage.getItem(`consented_${user.id}`);
           if (!hasConsented) {
          navigate("/client/consent", { replace: true });
          } else {
          navigate(ROUTES.CLIENT_DASHBOARD, { replace: true });
              }
            } else {
           navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
          }
      } else {
        setError("Invalid email or password");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Lock className="h-6 w-6 text-indigo-600" />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Sign In
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            VA Platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              name="email"
              type="email"
              required
              disabled={isLoading}
              value={credentials.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-slate-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>

            <div className="relative mt-1">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={isLoading}
                value={credentials.password}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-slate-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;