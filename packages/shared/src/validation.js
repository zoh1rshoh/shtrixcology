import { z } from 'zod';
export const phoneSchema = z
    .string()
    .regex(/^\+998\d{9}$/, "Telefon +998XXXXXXXXX formatida");
export const signupSchema = z.object({
    phone: phoneSchema,
    email: z.string().email().optional(),
    fullName: z.string().min(2).max(100),
    password: z.string().min(8).max(100),
});
export const loginSchema = z.object({
    phone: phoneSchema,
    password: z.string().min(1),
});
export const createPassportSchema = z.object({
    barcode: z.string().min(8).max(32),
    productName: z.string().min(1).max(200),
    photoBase64: z.string().min(100),
    declaredWeight: z.number().positive().max(10000),
    isEmpty: z.boolean(),
});
export const createTeamSchema = z.object({
    name: z.string().min(2).max(50),
    type: z.enum(['school', 'office', 'neighborhood', 'family', 'university']),
    city: z.string().min(2).max(50),
});
export const joinTeamSchema = z.object({
    teamId: z.string().uuid(),
});
//# sourceMappingURL=validation.js.map