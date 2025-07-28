export type CustomErrorContent = {
  message: string;
  context?: { [key: string]: any };
};

export abstract class CustomError extends Error {
  readonly statusCode: number;
  readonly logging: boolean;
  readonly context: { [key: string]: any };

  constructor(
    message: string,
    statusCode: number,
    context: { [key: string]: any } = {},
    logging = false,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.context = context;
    this.logging = logging;

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  get errors(): CustomErrorContent[] {
    return [{ message: this.message, context: this.context }];
  }
}

export class BadRequestError extends CustomError {
  constructor(
    message = 'Bad request',
    context?: { [key: string]: any },
    logging = false,
  ) {
    super(message, 400, context, logging);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(
    message = 'Unauthorized',
    context?: { [key: string]: any },
    logging = false,
  ) {
    super(message, 401, context, logging);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends CustomError {
  constructor(
    message = 'Forbidden: no permission',
    context?: { [key: string]: any },
    logging = false,
  ) {
    super(message, 403, context, logging);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends CustomError {
  constructor(
    message = 'Not Found',
    context?: { [key: string]: any },
    logging = false,
  ) {
    super(message, 404, context, logging);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class InternalServerError extends CustomError {
  constructor(
    message = 'Internal Server Error',
    context?: { [key: string]: any },
    logging = false,
  ) {
    super(message, 500, context, logging);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
