
export interface Company {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CLIENT";
  createdAt: string;
  updatedAt: string;
}


export interface ApiResponse<T> {
  data: T;
  message?: string;
}
