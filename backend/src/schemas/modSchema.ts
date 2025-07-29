import { z } from 'zod';

export const modQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),
    page: z
      .string()
      .regex(/^\d+$/)
      .transform((val) => parseInt(val, 10))
      .optional()
      .default(1),
  }),
});

export const createModBodySchema = z.object({
  body: z.object({
    name: z.string().min(5),
    specification: z
      .transform((val: string) => JSON.parse(val))
      .pipe(
        z
          .object({
            link: z.url('Must be a valid URL.'),
            modAuthor: z
              .string()
              .min(2, 'Mod author must be at least 2 characters.'),
          })
          .refine(
            (spec) => spec.link.startsWith('http'),
            'Link must start with http or https.',
          ),
      ),
    categories: z.preprocess(
      (val) => {
        if (typeof val === 'string') return [val];
        return val;
      },
      z.array(
        z
          .string()
          .min(3, 'Each category slug must be at least 3 characters long'),
      ),
    ),
  }),
});
