import path from "node:path"
import {ResponseError} from "../error/responseError"
import {z} from "zod"

export class DocumentationValidation {
    static readonly PREPARE = z.object({
        file_name: z.string().min(1).max(255).refine(value => !/[\x00-\x1f\x7f\\/]/.test(value), "Invalid file name"),
        mime_type: z.enum(["application/pdf", "image/png", "image/jpeg"]),
        size: z.number().int().positive().max(10 * 1024 * 1024)
    }).strict()
    static readonly COMPLETE = z.object({ticket: z.string().min(1).max(4096)}).strict()

    static extension(name: string, mime: string): "pdf" | "png" | "jpg" {
        const extension = path.extname(name).toLowerCase()
        if (extension === ".pdf" && mime === "application/pdf") return "pdf"
        if (extension === ".png" && mime === "image/png") return "png"
        if ([".jpg", ".jpeg"].includes(extension) && mime === "image/jpeg") return "jpg"
        throw new ResponseError(415, "Unsupported file type")
    }
    static validate(file: Express.Multer.File | undefined): string {
        if (!file || file.size === 0) {
            throw new ResponseError(400, "File is required")
        }
        if (file.size > 10 * 1024 * 1024) {
            throw new ResponseError(413, "Maximum file size is 10 MiB")
        }
        if (!file.originalname || file.originalname.length > 255
            || /[\x00-\x1f\x7f]/.test(file.originalname)
            || /[\\/]/.test(file.originalname)) {
            throw new ResponseError(400, "Invalid file name")
        }
        const extension = path.extname(file.originalname).toLowerCase()
        const buffer = file.buffer
        if (extension === ".pdf" && file.mimetype === "application/pdf"
            && buffer.subarray(0, 5).toString() === "%PDF-") {
            return "pdf"
        }
        if (extension === ".png" && file.mimetype === "image/png"
            && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
            return "png"
        }
        if ([".jpg", ".jpeg"].includes(extension) && file.mimetype === "image/jpeg"
            && buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
            return "jpg"
        }
        throw new ResponseError(415, "Unsupported file type")
    }
}
