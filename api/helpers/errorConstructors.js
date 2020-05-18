export class BaseError extends Error {
  constructor(name, message, status) {
    super(message);
    this.name = name;
    this.status = status;
  }
}

export class ValidationError extends BaseError {
  constructor(message) {
    super("message", message, 400);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message) {
    super("message", message, 401);
  }
}

export class NotFound extends BaseError {
  constructor(message) {
    super("message", message, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message) {
    super("message", message, 409);
  }
}

export class DeletedContactSuccess extends BaseError {
  constructor(message) {
    super("message", message, 200);
  }
}
