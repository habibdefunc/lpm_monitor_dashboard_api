import {z, ZodType} from "zod"
import {CreateCategoryRequest, UpdateCategoryRequest} from "../model/categoryModel"

export class CategoryValidation {
    static readonly CREATE: ZodType<CreateCategoryRequest> = z.object({
        name: z.string().trim().min(1).max(100),
        description: z.string().trim().min(1).max(255)
    }).strict()

    static readonly UPDATE: ZodType<UpdateCategoryRequest> = z.object({
        name: z.string().trim().min(1).max(100).optional(),
        description: z.string().trim().min(1).max(255).optional()
    }).strict().refine(
        value => Object.values(value).some(field => field !== undefined),
        "At least one field is required for update"
    )
}
