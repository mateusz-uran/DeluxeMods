export interface CustomErrorContent {
  context?: Record<string, unknown>;
  message: string;
}

export abstract class CustomError extends Error {
  readonly context: Record<string, unknown>;
  readonly logging: boolean;
  readonly statusCode: number;

  get errors(): CustomErrorContent[] {
    return [{ context: this.context, message: this.message }];
  }

  constructor(
    message: string,
    statusCode: number,
    context: Record<string, unknown> = {},
    logging = false,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.context = context;
    this.logging = logging;

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class BadRequestError extends CustomError {
  constructor(
    message = 'Bad request',
    context?: Record<string, unknown>,
    logging = false,
  ) {
    super(message, 400, context, logging);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class ForbiddenError extends CustomError {
  constructor(
    message = 'Forbidden: no permission',
    context?: Record<string, unknown>,
    logging = false,
  ) {
    super(message, 403, context, logging);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class InternalServerError extends CustomError {
  constructor(
    message = 'Internal Server Error',
    context?: Record<string, unknown>,
    logging = false,
  ) {
    super(message, 500, context, logging);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export class NotFoundError extends CustomError {
  constructor(
    message = 'Not Found',
    context?: Record<string, unknown>,
    logging = false,
  ) {
    super(message, 404, context, logging);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(
    message = 'Unauthorized',
    context?: Record<string, unknown>,
    logging = false,
  ) {
    super(message, 401, context, logging);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
