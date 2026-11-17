// Union type: a task can only be in one of these states.
export type TaskStatus = "pending" | "in-progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number; // references User.id
  createdAt: Date;
  updatedAt: Date;
}

// What a caller must provide to create a task.
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId: number;
}

// Every field is optional when updating.
export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "status" | "priority">
>;
