import {z} from "zod"

export class ApiValidation {
    static readonly ID = z.union([
        z.number(),
        z.string().regex(/^[0-9]+$/).transform(Number)
    ]).pipe(z.number().int().positive().max(2147483647))

    static readonly DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
        const date = new Date(value + "T00:00:00.000Z")
        if (Number.isNaN(date.getTime())) {
            return false
        }
        return value >= "1000-01-01" && value <= "9999-12-31"
            && date.toISOString().slice(0, 10) === value
    }, "Invalid date")

    static readonly STATUS = z.enum(["DIRENCANAKAN", "BERJALAN", "SELESAI"])
    static readonly EMPTY_QUERY = z.object({}).strict()
}
