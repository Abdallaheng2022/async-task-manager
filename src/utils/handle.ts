import { AppError } from "../errors.js";
import type { ApiResponse } from "../types/index.js";

// Wraps any async operation into an ApiResponse<T>.
// Success is only reported AFTER the awaited operation resolves,
// so a failed operation can never produce a false "success".
export async function handle<T>(operation: () => Promise<T>): Promise<ApiResponse<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return { success: false, error: { code: error.code, message: error.message } };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: { code: "INTERNAL_ERROR", message } };
  }
}
