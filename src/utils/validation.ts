import { ValidationError } from "../errors.js";
import type { CreateTaskInput, TaskPriority, TaskStatus } from "../types/index.js";

// TypeScript types disappear at runtime, so incoming data is treated as `unknown`
// and checked before use (no `any`).

const PRIORITIES: readonly TaskPriority[] = ["low", "medium", "high"];
const STATUSES: readonly TaskStatus[] = ["pending", "in-progress", "completed"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === "string" && (PRIORITIES as readonly string[]).includes(value);
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export function parseCreateTaskInput(input: unknown): CreateTaskInput {
  if (!isRecord(input)) {
    throw new ValidationError("Task input must be an object");
  }

  const { title, description, priority, assigneeId } = input;

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new ValidationError("title must be a non-empty string");
  }
  if (typeof assigneeId !== "number" || !Number.isInteger(assigneeId)) {
    throw new ValidationError("assigneeId must be an integer");
  }
  if (description !== undefined && typeof description !== "string") {
    throw new ValidationError("description must be a string");
  }
  if (priority !== undefined && !isTaskPriority(priority)) {
    throw new ValidationError(`priority must be one of: ${PRIORITIES.join(", ")}`);
  }

  const parsed: CreateTaskInput = { title: title.trim(), assigneeId };
  if (description !== undefined) parsed.description = description;
  if (priority !== undefined) parsed.priority = priority;
  return parsed;
}
