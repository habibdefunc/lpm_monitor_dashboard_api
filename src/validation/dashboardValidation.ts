import {z} from "zod"
import {ApiValidation} from "./apiValidation"

export class DashboardValidation {
    static readonly GET = z.object({
        year: ApiValidation.ID.refine(value => value <= 9999, "Invalid year").optional()
    }).strict()
}
