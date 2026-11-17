import type { Task, User } from "../types/index.js";

// In-memory "database". Swappable later for PostgreSQL/Prisma (Sessions 5-6).
export interface Store {
  users: Map<number, User>;
  tasks: Map<number, Task>;
  nextTaskId: number;
}

export function createStore(): Store {
  const users: User[] = [
    { id: 1, name: "Ali", email: "ali@example.com", role: "admin", isActive: true },
    { id: 2, name: "Sara", email: "sara@example.com", role: "member", isActive: true },
    { id: 3, name: "Omar", email: "omar@example.com", role: "member", isActive: false },
  ];

  return {
    users: new Map(users.map((u) => [u.id, u])),
    tasks: new Map(),
    nextTaskId: 1,
  };
}
