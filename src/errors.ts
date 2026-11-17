// Custom errors let callers tell failure types apart.
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: number) {
    super(`${entity} with id ${id} was not found`, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, "FORBIDDEN");
  }
}
