import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createApp, type App } from "../src/app.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../src/errors.js";
import { handle } from "../src/utils/handle.js";

let app: App;
beforeEach(() => {
  app = createApp();
});

describe("TaskService - success", () => {
  it("creates a task with default priority and pending status", async () => {
    const task = await app.taskService.createTask({ title: "Review API", assigneeId: 1 });
    assert.equal(task.id, 1);
    assert.equal(task.status, "pending");
    assert.equal(task.priority, "medium");
  });

  it("updates and completes a task", async () => {
    const task = await app.taskService.createTask({ title: "A", assigneeId: 2 });
    const done = await app.taskService.completeTask(task.id);
    assert.equal(done.status, "completed");
  });

  it("filters tasks by assignee", async () => {
    await app.taskService.createTask({ title: "A", assigneeId: 1 });
    await app.taskService.createTask({ title: "B", assigneeId: 2 });
    const tasks = await app.taskService.listTasks({ assigneeId: 2 });
    assert.deepEqual(tasks.map((t) => t.title), ["B"]);
  });

  it("deletes a task", async () => {
    const task = await app.taskService.createTask({ title: "A", assigneeId: 1 });
    await app.taskService.deleteTask(task.id);
    await assert.rejects(app.taskService.getTaskById(task.id), NotFoundError);
  });
});

describe("TaskService - failure", () => {
  it("rejects an unknown assignee", async () => {
    await assert.rejects(
      app.taskService.createTask({ title: "A", assigneeId: 99 }),
      NotFoundError,
    );
  });

  it("rejects an inactive assignee", async () => {
    await assert.rejects(
      app.taskService.createTask({ title: "A", assigneeId: 3 }),
      ForbiddenError,
    );
  });

  it("rejects invalid input (wrong types)", async () => {
    await assert.rejects(
      app.taskService.createTask({ id: "101", title: "", completed: "false" }),
      ValidationError,
    );
    await assert.rejects(app.taskService.createTask(null), ValidationError);
    await assert.rejects(
      app.taskService.createTask({ title: "A", assigneeId: 1, priority: "urgent" }),
      ValidationError,
    );
  });

  it("rejects completing a task twice", async () => {
    const task = await app.taskService.createTask({ title: "A", assigneeId: 1 });
    await app.taskService.completeTask(task.id);
    await assert.rejects(app.taskService.completeTask(task.id), ValidationError);
  });

  it("never reports false success", async () => {
    const res = await handle(() => app.taskService.createTask({ title: "A", assigneeId: 99 }));
    assert.equal(res.success, false);
    if (!res.success) assert.equal(res.error.code, "NOT_FOUND");
    assert.equal((await app.taskService.listTasks()).length, 0);
  });

  it("createMany reports each result independently", async () => {
    const results = await app.taskService.createMany([
      { title: "ok", assigneeId: 1 },
      { title: "bad", assigneeId: 99 },
    ]);
    assert.deepEqual(results.map((r) => r.status), ["fulfilled", "rejected"]);
  });
});
