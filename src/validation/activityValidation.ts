import {z} from "zod"
import {ApiValidation} from "./apiValidation"

export class ActivityValidation {
    static readonly CREATE = z.object({
        name: z.string().trim().min(1).max(150),
        description: z.string().max(5000).nullable().optional(),
        start_date: ApiValidation.DATE,
        end_date: ApiValidation.DATE,
        category_id: ApiValidation.ID,
        responsible_user_id: ApiValidation.ID,
        status: ApiValidation.STATUS.default("DIRENCANAKAN")
    }).strict().refine(
        value => value.end_date >= value.start_date,
        "End date must not be before start date"
    )

    static readonly UPDATE = z.object({
        name: z.string().trim().min(1).max(150).optional(),
        description: z.string().max(5000).nullable().optional(),
        start_date: ApiValidation.DATE.optional(),
        end_date: ApiValidation.DATE.optional(),
        category_id: ApiValidation.ID.optional(),
        responsible_user_id: ApiValidation.ID.optional(),
        status: ApiValidation.STATUS.optional()
    }).strict().refine(
        value => Object.values(value).some(field => field !== undefined),
        "At least one field is required for update"
    )

    static readonly UPDATE_STATUS = z.object({
        status: ApiValidation.STATUS
    }).strict()

    static readonly LIST = z.object({
        search: z.string().trim().min(1).max(150).optional(),
        start_date: ApiValidation.DATE.optional(),
        end_date: ApiValidation.DATE.optional(),
        category_id: ApiValidation.ID.optional(),
        responsible_user_id: ApiValidation.ID.optional(),
        status: ApiValidation.STATUS.optional(),
        page: ApiValidation.ID.default(1),
        size: ApiValidation.ID.refine(value => value <= 100, "Maximum size is 100").default(10)
    }).strict().refine(
        value => !value.start_date || !value.end_date || value.end_date >= value.start_date,
        "End date must not be before start date"
    )
}
