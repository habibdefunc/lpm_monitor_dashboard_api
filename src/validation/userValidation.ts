import { CreateUserRequest, LoginUserRequest, UpdateUserRequest, UpdateCurrentUserRequest } from "../model/userModel"
import {z, ZodType} from "zod";

export class UserValidation {
    static readonly DELETE_REQUEST = z.object({
        confirm: z.literal(true),
        replacement_user_id: z.number().int().positive().max(2147483647).optional()
    }).strict()
    static readonly ID: ZodType<number> = z.number().int().positive().max(2147483647)

    static readonly DELETE: ZodType<number> = z.number().int().positive().max(2147483647)

    static readonly REGISTER: ZodType<CreateUserRequest> = z.object({
        username: z.string().min(1).max(100),
        password: z.string().min(1).max(255),
        name: z.string().min(1).max(100),
        jenis_kel: z.string().min(1).max(100),
        email: z.string().min(1).max(254),
        no_hp: z.string().min(1).max(20),
        alamat: z.string().min(1).max(500),
        role: z.string().refine(value => value === "ADMIN" || value === "STAF", "Role must be ADMIN or STAF")
    }).strict()

    static readonly LOGIN: ZodType<LoginUserRequest> = z.object({
        username: z.string().min(1).max(100),
        password: z.string().min(1).max(255),
    }).strict()

     static readonly UPDATE: ZodType<UpdateUserRequest> = z.object({
        username: z.string().min(1).max(100).optional(),
        password: z.string().min(1).max(255).optional(),
        name: z.string().min(1).max(100).optional(),
        jenis_kel: z.string().min(1).max(100).optional(),
        email: z.string().min(1).max(254).optional(),
        no_hp: z.string().min(1).max(20).optional(),
        alamat: z.string().min(1).max(500).optional(),
        role: z.string().refine(value => value === "ADMIN" || value === "STAF", "Role must be ADMIN or STAF").optional()
    }).strict().refine(value => Object.keys(value).length > 0, "At least one field is required for update")

     static readonly UPDATE_CURRENT: ZodType<UpdateCurrentUserRequest> = z.object({
        username: z.string().min(1).max(100).optional(),
        password: z.string().min(1).max(255).optional(),
        name: z.string().min(1).max(100).optional(),
        jenis_kel: z.string().min(1).max(100).optional(),
        email: z.string().min(1).max(254).optional(),
        no_hp: z.string().min(1).max(20).optional(),
        alamat: z.string().min(1).max(500).optional(),
    }).strict().refine(value => Object.keys(value).length > 0, "At least one field is required for update")

}
