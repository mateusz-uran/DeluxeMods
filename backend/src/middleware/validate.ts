import type { NextFunction, Request, Response } from 'express';

import {ZodObject, ZodRawShape } from 'zod';

export function validateRequest(schema: ZodObject<ZodRawShape>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body as unknown,
      params: req.params as unknown,
      query: req.query as unknown,
    });

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path.join('.'),
        })),
        message: 'Validation failed',
        status: 'error',
      });
    }

    req.validated = result.data;

    next();
  };
}
