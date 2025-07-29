import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

type ValidateInput = (
  schema: z.ZodObject<{
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
  }>,
) => MiddlewareFunction;

export const validateRequest: ValidateInput =
  (schema): MiddlewareFunction =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: result.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      });
    }

    req.validated = result.data;

    next();
  };
