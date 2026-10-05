import { z } from 'zod';
export declare const phoneSchema: z.ZodString;
export declare const signupSchema: z.ZodObject<{
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    fullName: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    fullName: string;
    password: string;
    email?: string | undefined;
}, {
    phone: string;
    fullName: string;
    password: string;
    email?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    phone: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    password: string;
}, {
    phone: string;
    password: string;
}>;
export declare const createPassportSchema: z.ZodObject<{
    barcode: z.ZodString;
    productName: z.ZodString;
    photoBase64: z.ZodString;
    declaredWeight: z.ZodNumber;
    isEmpty: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    barcode: string;
    productName: string;
    photoBase64: string;
    declaredWeight: number;
    isEmpty: boolean;
}, {
    barcode: string;
    productName: string;
    photoBase64: string;
    declaredWeight: number;
    isEmpty: boolean;
}>;
export declare const createTeamSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["school", "office", "neighborhood", "family", "university"]>;
    city: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "school" | "office" | "neighborhood" | "family" | "university";
    name: string;
    city: string;
}, {
    type: "school" | "office" | "neighborhood" | "family" | "university";
    name: string;
    city: string;
}>;
export declare const joinTeamSchema: z.ZodObject<{
    teamId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    teamId: string;
}, {
    teamId: string;
}>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePassportInput = z.infer<typeof createPassportSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type JoinTeamInput = z.infer<typeof joinTeamSchema>;
//# sourceMappingURL=validation.d.ts.map