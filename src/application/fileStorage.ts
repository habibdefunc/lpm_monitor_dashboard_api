import path from "node:path"
import {mkdir, writeFile, unlink, readFile, rename} from "node:fs/promises"
import {randomUUID} from "node:crypto"
import {ResponseError} from "../error/responseError"

export class FileStorage {
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
        await mkdir(this.DIRECTORY, {recursive: true})
        const fileName = randomUUID() + "." + extension
        await writeFile(this.resolve(fileName), buffer, {flag: "wx"})
        return fileName
    }

    static async read(fileName: string): Promise<Buffer> {
        return readFile(this.resolve(fileName))
    }

    static async delete(fileName: string): Promise<void> {
        try{
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
                const temporary = randomUUID() + ".pending-delete"
                try{
                    await rename(this.resolve(fileName), this.resolve(temporary))
                    files.push({original: fileName, temporary: temporary})
                }
                catch (error){
                    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
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
            await rename(this.resolve(file.temporary), this.resolve(file.original))
        }
    }

    static async purge(files: {original: string, temporary: string}[]): Promise<void> {
        for (const file of files) {
            await this.delete(file.temporary)
        }
    }
}
