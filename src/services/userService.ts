import type { Store } from "../data/store.js";
import { NotFoundError } from "../errors.js";
import type { User } from "../types/index.js";
import { delay } from "../utils/delay.js";

export class UserService {
  constructor(private readonly store: Store) {}

  async getUserById(id: number): Promise<User> {
    await delay(20);
    const user = this.store.users.get(id);
    if (!user) {
      throw new NotFoundError("User", id); // rejects the returned Promise
    }
    return user;
  }

  async listUsers(): Promise<User[]> {
    await delay(10);
    return [...this.store.users.values()];
  }
}
