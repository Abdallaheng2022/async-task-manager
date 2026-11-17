export type UserRole = "admin" | "member";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
