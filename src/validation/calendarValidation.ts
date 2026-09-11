import {z} from "zod"
import {ApiValidation} from "./apiValidation"

export class CalendarValidation {
    static readonly GET = z.object({
        month: ApiValidation.ID.refine(value => value <= 12, "Invalid month").optional(),
        year: ApiValidation.ID.refine(value => value <= 9999, "Invalid year").optional(),
        category_id: ApiValidation.ID.optional(),
        responsible_user_id: ApiValidation.ID.optional(),
        status: ApiValidation.STATUS.optional()
    }).strict()
}
