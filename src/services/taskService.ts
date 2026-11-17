import type { Store } from "../data/store.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors.js";
import type { Task, TaskStatus, UpdateTaskInput } from "../types/index.js";
import { delay } from "../utils/delay.js";
import { isTaskStatus, parseCreateTaskInput } from "../utils/validation.js";
import type { UserService } from "./userService.js";

export class TaskService {
  constructor(
    private readonly store: Store,
    private readonly users: UserService,
  ) {}

  // Input is `unknown` on purpose: it is validated at runtime before use.
  async createTask(input: unknown): Promise<Task> {
    const data = parseCreateTaskInput(input);

    // `await` is required: without it, `assignee` would be a Promise, not a User.
    const assignee = await this.users.getUserById(data.assigneeId);
    if (!assignee.isActive) {
      throw new ForbiddenError(`User ${assignee.name} is inactive and cannot receive tasks`);
    }

    await delay(30); // simulated DB write
    const now = new Date();
    const task: Task = {
      id: this.store.nextTaskId++,
      title: data.title,
      status: "pending",
      priority: data.priority ?? "medium",
      assigneeId: assignee.id,
      createdAt: now,
      updatedAt: now,
    };
    if (data.description !== undefined) task.description = data.description;

    this.store.tasks.set(task.id, task);
    return task;
  }

  async getTaskById(id: number): Promise<Task> {
    await delay(15);
    const task = this.store.tasks.get(id);
    if (!task) throw new NotFoundError("Task", id);
    return task;
  }

  async listTasks(filter?: { status?: TaskStatus; assigneeId?: number }): Promise<Task[]> {
    await delay(15);
    return [...this.store.tasks.values()].filter(
      (t) =>
        (filter?.status === undefined || t.status === filter.status) &&
        (filter?.assigneeId === undefined || t.assigneeId === filter.assigneeId),
    );
  }

  async updateTask(id: number, changes: UpdateTaskInput): Promise<Task> {
    const task = await this.getTaskById(id);

    if (changes.status !== undefined && !isTaskStatus(changes.status)) {
      throw new ValidationError(`Invalid status: ${String(changes.status)}`);
    }
    if (changes.title !== undefined && changes.title.trim().length === 0) {
      throw new ValidationError("title cannot be empty");
    }

    await delay(20);
    const updated: Task = { ...task, ...changes, updatedAt: new Date() };
    this.store.tasks.set(id, updated);
    return updated;
  }

  async completeTask(id: number): Promise<Task> {
    const task = await this.getTaskById(id);
    if (task.status === "completed") {
      throw new ValidationError(`Task ${id} is already completed`);
    }
    return this.updateTask(id, { status: "completed" });
  }

  async deleteTask(id: number): Promise<void> {
    await this.getTaskById(id); // throws NotFoundError if missing
    await delay(10);
    this.store.tasks.delete(id);
  }

  // Runs several creations in parallel; reports each result separately
  // instead of failing everything when one fails.
  async createMany(inputs: unknown[]): Promise<PromiseSettledResult<Task>[]> {
    return Promise.allSettled(inputs.map((input) => this.createTask(input)));
  }
}
