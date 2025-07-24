import { BadRequestError } from '../utils/errors/HttpError.js';

export const validateRequest =
  ({ paramsSchema, querySchema, bodySchema }) =>
  (req, res, next) => {
    try {
      if (paramsSchema) req.validatedParams = paramsSchema.parse(req.params);
      if (querySchema) req.validatedQuery = querySchema.parse(req.query);
      if (bodySchema) req.validatedBody = bodySchema.parse(req.body);
      next();
    } catch (err) {
      console.log(`[Error: ${err.message}]`);
      if (err.name === 'ZodError') {
        const formattedErrors = err.errors.map((e) => ({
          message: e.message,
          path: e.path.join('.'),
        }));
        throw new BadRequestError({
          message: 'Validation failed',
          context: { issues: formattedErrors },
        });
      }
      next(err);
    }
  };
