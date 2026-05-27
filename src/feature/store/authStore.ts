import { create } from "zustand";
import { persist } from "zustand/middleware";
import Axios from "../../api/Axios";
import { ROUTES } from "../../constants/routes";

interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CLIENT";
}

interface AuthState {
  user: User | null;
  token: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email: string, password: string) => {
        try {
          
          const response = await Axios.post("/auth/login", {
            email: email.trim().toLowerCase(),
            password: password.trim(),
          });

          const { token, user } = response.data;

          if (!token || !user) {
            return false;
          }

          // token for interceptor usage
          localStorage.setItem("va-token", token);

           //Zustand 
          set({ token, user });

          return true;
        } catch (error) {
          console.error("Login failed", error);
          return false;
        }
      },

      logout: () => {
        //persisted token
        localStorage.removeItem("va-token");

        set({ token: null, user: null });

        window.location.href = ROUTES.LOGIN;
      },

      isAuthenticated: () => {
        return Boolean(get().token);
      },
    }),
    {
      name: "va-auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
