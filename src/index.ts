import { createApp } from "./app.js";
import type { ApiResponse } from "./types/index.js";
import { handle } from "./utils/handle.js";

function log<T>(label: string, response: ApiResponse<T>): void {
  if (response.success) {
    console.log(`✅ ${label}`, response.data);
  } else {
    console.log(`❌ ${label} -> [${response.error.code}] ${response.error.message}`);
  }
}

async function main(): Promise<void> {
  const { taskService, userService } = createApp();

  console.log("=== Success cases ===");
  log("List users", await handle(() => userService.listUsers()));

  const created = await handle(() =>
    taskService.createTask({ title: "Review API", priority: "high", assigneeId: 1 }),
  );
  log("Create task", created);

  log(
    "Create second task",
    await handle(() => taskService.createTask({ title: "Write README", assigneeId: 2 })),
  );

  if (created.success) {
    const id = created.data.id;
    log("Start task", await handle(() => taskService.updateTask(id, { status: "in-progress" })));
    log("Complete task", await handle(() => taskService.completeTask(id)));
  }

  log("List completed tasks", await handle(() => taskService.listTasks({ status: "completed" })));

  console.log("\n=== Failure cases ===");
  log("Unknown user", await handle(() => taskService.createTask({ title: "X", assigneeId: 99 })));
  log("Inactive user", await handle(() => taskService.createTask({ title: "X", assigneeId: 3 })));
  // The buggy AI example from the slides: wrong types are rejected at runtime.
  log(
    "Invalid input",
    await handle(() => taskService.createTask({ id: "101", title: "", completed: "false" })),
  );
  log("Missing task", await handle(() => taskService.getTaskById(404)));
  log("Complete twice", await handle(() => taskService.completeTask(1)));
  log("Delete missing", await handle(() => taskService.deleteTask(404)));

  console.log("\n=== Parallel (Promise.allSettled) ===");
  const results = await taskService.createMany([
    { title: "Deploy", assigneeId: 1 },
    { title: "Bad", assigneeId: 99 },
    { title: "Docs", priority: "low", assigneeId: 2 },
  ]);
  results.forEach((r, i) => {
    if (r.status === "fulfilled") console.log(`✅ #${i} created task ${r.value.id}`);
    else console.log(`❌ #${i} ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`);
  });
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
