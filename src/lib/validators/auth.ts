// src/lib/validators/auth.ts
import { z } from "zod";


export const authSchema = z.object(
  {
    email: z.string()
      .trim()
      .pipe(
        z.email({ error: "Invalid email address" }).toLowerCase()
      ),
    password: z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z
      .string('Required')
      .min(8, { message: 'min 8' })
      .optional(),
  }
)
  .refine(
    (values) => {
     return !values.confirmPassword || values.password === values.confirmPassword;
    },
    {
      message: "Passwords Don't match",
      path: ['confirmPassword'],
    }
  )

export type AuthInput = z.infer<typeof authSchema>;

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };

/**
 * validateAuth
 * - Parses the input with Zod
 * - Returns a structured result:
 *    { success: true, data } or { success: false, errors }
 *
 * Usage:
 * const res = validateAuth({ email, password });
 * if (!res.success) show errors; otherwise proceed with res.data
 */
export function validateAuth(input: unknown): ValidationResult<AuthInput> {
  const parseResult = authSchema.safeParse(input);

  if (parseResult.success) {
    return { success: true, data: parseResult.data };
  }

  const errors: Record<string, string[]> = {};
  const zodErr = parseResult.error;
  for (const issue of zodErr.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "_";
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }

  return { success: false, errors };
}
