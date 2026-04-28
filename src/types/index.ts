export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "AUDITOR"
  | "CLIENT";


export interface Company {
  id: string;
  name: string;
  industry?: string;
  description?: string;

  email?: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive";
  location?: string;
  contacts: User[];

  contactEmail?: string;
  contactPhone?: string;

  createdAt: string;
  updatedAt: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  company?: Company;

  createdAt: string;
  updatedAt: string;
}


export interface ApiResponse<T> {
  data: T;
  message?: string;
}