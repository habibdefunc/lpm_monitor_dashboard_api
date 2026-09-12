import path from "node:path"
import {mkdir, writeFile, unlink, readFile, rename} from "node:fs/promises"
import {randomUUID} from "node:crypto"
import {ResponseError} from "../error/responseError"
import {SupabaseStorage} from "./supabaseStorage"

export class FileStorage {
    static isRemote(fileName: string): boolean { return fileName.startsWith("supabase:") }

    static async move(source: string, destination: string): Promise<void> {
        if (this.isRemote(source) && this.isRemote(destination)) {
            await SupabaseStorage.move(source.slice(9), destination.slice(9))
            return
        }
        await rename(this.resolve(source), this.resolve(destination))
    }
    static readonly DIRECTORY = path.resolve("storage/documentations")

    static resolve(fileName: string): string {
        if (!fileName || path.basename(fileName) !== fileName
            || fileName.includes("\\") || fileName.includes("/")) {
            throw new ResponseError(500, "Invalid stored file path")
        }
        const filePath = path.resolve(this.DIRECTORY, fileName)
        if (path.dirname(filePath) !== this.DIRECTORY) {
            throw new ResponseError(500, "Invalid stored file path")
        }
        return filePath
    }

    static async save(buffer: Buffer, extension: string): Promise<string> {
        if (!["pdf", "png", "jpg"].includes(extension)) {
            throw new ResponseError(415, "Unsupported file type")
        }
        const fileName = randomUUID() + "." + extension
        if (process.env.NODE_ENV !== "test" && (process.env.VERCEL || process.env.SUPABASE_URL)) {
            const mime = extension === "pdf" ? "application/pdf" : extension === "png" ? "image/png" : "image/jpeg"
            await SupabaseStorage.save(fileName, buffer, mime)
            return "supabase:" + fileName
        }
        await mkdir(this.DIRECTORY, {recursive: true})
        await writeFile(this.resolve(fileName), buffer, {flag: "wx"})
        return fileName
    }

    static async read(fileName: string): Promise<Buffer> {
        if (this.isRemote(fileName)) return SupabaseStorage.read(fileName.slice(9))
        return readFile(this.resolve(fileName))
    }

    static async delete(fileName: string): Promise<void> {
        try{
            if (this.isRemote(fileName)) {
                await SupabaseStorage.remove(fileName.slice(9))
                return
            }
            await unlink(this.resolve(fileName))
        }
        catch (error){
            if (error instanceof Error && "code" in error && error.code === "ENOENT") {
                return
            }
            throw error
        }
    }

    // Temporarily move files so a failed database delete can restore them.
    static async stage(fileNames: string[]): Promise<{original: string, temporary: string}[]> {
        const files: {original: string, temporary: string}[] = []
        try{
            for (const fileName of fileNames) {
                const temporary = (this.isRemote(fileName) ? "supabase:" : "") + randomUUID() + ".pending-delete"
                try{
                    await this.move(fileName, temporary)
                    files.push({original: fileName, temporary: temporary})
                }
                catch (error){
                    if ((error instanceof Error && "code" in error && error.code === "ENOENT")
                        || (error instanceof ResponseError && error.status === 404)) {
                        continue
                    }
                    throw error
                }
            }
            return files
        }
        catch (error){
            await this.restore(files)
            throw error
        }
    }

    static async restore(files: {original: string, temporary: string}[]): Promise<void> {
        for (const file of files) {
            await this.move(file.temporary, file.original)
        }
    }

    static async purge(files: {original: string, temporary: string}[]): Promise<void> {
        for (const file of files) {
            await this.delete(file.temporary)
        }
    }
}
