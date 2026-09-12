import {createHmac, timingSafeEqual} from "node:crypto"
import {z} from "zod"
import {ResponseError} from "../error/responseError"
import {SupabaseStorage} from "./supabaseStorage"

const schema = z.object({
    id: z.uuid(), userId: z.number().int().positive(), activityId: z.number().int().positive(),
    name: z.string().min(1).max(255), mime: z.enum(["application/pdf", "image/png", "image/jpeg"]),
    size: z.number().int().positive().max(10 * 1024 * 1024),
    extension: z.enum(["pdf", "png", "jpg"]), expires: z.number()
}).strict()
export type UploadTicketData = z.infer<typeof schema>

export class UploadTicket {
    static signature(value: string): Buffer {
        return createHmac("sha256", SupabaseStorage.config().key).update("lpm-upload:" + value).digest()
    }
    static create(data: UploadTicketData): string {
        const value = Buffer.from(JSON.stringify(schema.parse(data))).toString("base64url")
        return value + "." + this.signature(value).toString("base64url")
    }
    static verify(ticket: string): UploadTicketData {
        const [value, signature, extra] = ticket.split(".")
        if (!value || !signature || extra) throw new ResponseError(400, "Invalid upload ticket")
        const received = Buffer.from(signature, "base64url")
        const expected = this.signature(value)
        if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new ResponseError(400, "Invalid upload ticket")
        let data: UploadTicketData
        try { data = schema.parse(JSON.parse(Buffer.from(value, "base64url").toString())) }
        catch { throw new ResponseError(400, "Invalid upload ticket") }
        if (data.expires < Date.now()) throw new ResponseError(410, "Upload ticket expired. Select the file again.")
        return data
    }
}
