import { createStore } from "./data/store.js";
import { TaskService } from "./services/taskService.js";
import { UserService } from "./services/userService.js";

// Wires the services together. Tests call this to get a fresh, isolated app.
export function createApp() {
  const store = createStore();
  const userService = new UserService(store);
  const taskService = new TaskService(store, userService);
  return { store, userService, taskService };
}

export type App = ReturnType<typeof createApp>;
