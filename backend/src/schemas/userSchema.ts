import z from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(3, { message: 'Password is required' }),
    rememberMe: z.boolean().optional().default(false),
  }),
});

export type LoginValidated = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Invalid email address' }),
    name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
    password: z.string().min(3, { message: 'Password is required' }),
  }),
});

export type RegisterValidated = z.infer<typeof registerSchema>

export const updateRoleSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Invalid email address' }),
    newRole: z
      .string()
      .min(3, { message: 'Provide proper role name.' })
      .optional(),
    oldRole: z
      .string()
      .min(3, { message: 'Provide proper role name.' })
      .optional(),
  }),
});

export type UpdateRoleValidated = z.infer<typeof updateRoleSchema>