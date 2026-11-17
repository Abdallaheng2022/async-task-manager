// Generic response wrapper: reuse one shape without losing the type of `data`.
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
