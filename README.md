# Async Task Management Backend (TypeScript + ESM)

Session 2 assignment for the Core Istanbul Backend Course: **Asynchronous Programming & TypeScript Foundations**.

A small Node.js backend that manages tasks and users with async operations, typed data contracts, runtime validation and clear success/failure handling. Data is kept in memory; a real database comes in later sessions (PostgreSQL / Prisma).

## Requirements checklist

| #   | Requirement                                       | Where                                                                                                |
| --- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Node.js backend using TypeScript and ESM          | `"type": "module"`, `module: "NodeNext"` in `tsconfig.json`, `.js` import paths                      |
| 2   | `Task` and `User` interfaces                      | `src/types/task.ts`, `src/types/user.ts`                                                             |
| 3   | Async task operations with Promises / async-await | `src/services/taskService.ts`, `src/services/userService.ts`                                         |
| 4   | Handle success and failure cases                  | Custom errors in `src/errors.ts`, `handle()` in `src/utils/handle.ts`, demo in `src/index.ts`, tests |
| 5   | Strict mode + npm scripts                         | `"strict": true` (plus extra strict flags), scripts below                                            |
| 6   | Verify, publish on GitHub, document AI use        | `npm run verify`, this README                                                                        |

## Project structure

```
async-task-manager/
├── src/
│   ├── types/
│   │   ├── user.ts          # User interface + UserRole union
│   │   ├── task.ts          # Task interface, TaskStatus/TaskPriority unions, input types
│   │   ├── api.ts           # Generic ApiResponse<T>
│   │   └── index.ts         # Re-exports
│   ├── data/
│   │   └── store.ts         # In-memory store with seed users
│   ├── services/
│   │   ├── userService.ts   # Async user lookups
│   │   └── taskService.ts   # Async CRUD for tasks + Promise.allSettled batch
│   ├── utils/
│   │   ├── delay.ts         # Simulated DB latency (Promise + setTimeout)
│   │   ├── validation.ts    # unknown -> typed input (type guards, no `any`)
│   │   └── handle.ts        # Wraps async calls into ApiResponse<T>
│   ├── errors.ts            # AppError, NotFoundError, ValidationError, ForbiddenError
│   ├── app.ts               # Wires services together
│   └── index.ts             # Demo: success, failure and parallel scenarios
├── tests/
│   └── taskService.test.ts  # node:test - 10 success/failure tests
├── tsconfig.json            # Strict build config (src -> dist)
├── tsconfig.test.json       # Type-checks src + tests
└── package.json
```

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # run src/index.ts with tsx (watch mode)
```

## npm scripts

| Script              | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Runs `src/index.ts` directly with `tsx` and restarts on changes |
| `npm run typecheck` | `tsc --noEmit` on `src` and `tests` (strict)                    |
| `npm test`          | Runs the tests with Node's built-in test runner                 |
| `npm run build`     | Compiles `src/` to `dist/`                                      |
| `npm start`         | Runs the compiled `dist/index.js`                               |
| `npm run verify`    | typecheck → test → build → start                                |
| `npm run clean`     | Removes `dist/`                                                 |

## Key concepts from the session

- **Interfaces and unions**: `Task.status` can only be `"pending" | "in-progress" | "completed"`.
- **Generics**: `ApiResponse<T>` keeps the type of `data` (`ApiResponse<Task>`, `ApiResponse<User[]>`).
- **`unknown` instead of `any`**: `createTask(input: unknown)` validates input at runtime before using it, because TypeScript types do not exist at runtime.
- **async/await with `try/catch`**: every service method `await`s the steps it depends on, so `user` is never a Promise by mistake.
- **No false success**: `handle()` only returns `success: true` after the awaited operation resolves; any rejection becomes `success: false` with an error code.
- **`Promise.allSettled`**: `createMany()` runs creations in parallel and reports each result, so one failure does not hide the others.

## Example output (`npm start`)

```
=== Failure cases ===
❌ Unknown user -> [NOT_FOUND] User with id 99 was not found
❌ Inactive user -> [FORBIDDEN] User Omar is inactive and cannot receive tasks
❌ Invalid input -> [VALIDATION_ERROR] title must be a non-empty string
❌ Missing task -> [NOT_FOUND] Task with id 404 was not found
❌ Complete twice -> [VALIDATION_ERROR] Task 1 is already completed

=== Parallel (Promise.allSettled) ===
✅ #0 created task 3
❌ #1 User with id 99 was not found
✅ #2 created task 4
```

## Verification

Checked with `npm run verify`:

- `npm run typecheck`: no errors with `strict: true`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- `npm test`: 10/10 tests pass (4 success, 6 failure)
- `npm run build` + `npm start`: compiled ESM output runs and prints the expected success and failure results

## AI use

I used an AI assistant (Claude) to help with this assignment, following the session's **Predict → Run → Verify** approach.

**What AI helped with**

- Proposing the folder structure and the `tsconfig.json` / npm scripts setup
- Drafting the interfaces, services, validation helpers and tests
- Writing a first draft of this README

**How I verified it**

- Ran `npm run typecheck`, `npm test`, `npm run build` and `npm start` and checked the output myself
- Reviewed the code for the AI mistakes covered in the session:
  - missing `await` (a value being a Promise instead of data)
  - missing `return` in a Promise chain
  - false success (printing success after a failed operation)
  - use of `any` or turning off `strict` to hide type errors
- Confirmed no `any` is used anywhere (`grep -r "any" src` only matches comments/words)
- Tried the buggy task object from the slides (`id: "101"`, `completed: "false"`) and confirmed it is rejected
