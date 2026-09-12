import {ResponseError} from "../error/responseError"
import {logger} from "./logging"

// Server-only REST client. Never expose this key or forward application tokens.
export class SupabaseStorage {
    static config() {
        const url = process.env.SUPABASE_URL?.replace(/\/+$/, "")
        const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documentations"
        if (!url || !key) throw new ResponseError(503, "Supabase Storage is not configured")
        if (!/^https:\/\/[^/?#]+$/.test(url)) throw new ResponseError(503, "SUPABASE_URL must be the HTTPS project URL")
        return {url: url + "/storage/v1", key, bucket}
    }

    static objectPath(name: string): string {
        if (!/^[a-zA-Z0-9._-]+$/.test(name)) throw new ResponseError(400, "Invalid storage path")
        return encodeURIComponent(this.config().bucket) + "/" + encodeURIComponent(name)
    }

    static async request(path: string, method = "GET", body?: string | Uint8Array, mime = "application/json"): Promise<Response> {
        const config = this.config()
        const response = await fetch(config.url + path, {
            method,
            headers: {
                apikey: config.key,
                ...(!config.key.startsWith("sb_secret_") ? {Authorization: "Bearer " + config.key} : {}),
                "Content-Type": mime
            },
            ...(body === undefined ? {} : {body: typeof body === "string" ? body : new Uint8Array(body)}),
            signal: AbortSignal.timeout(20000)
        })
        if (!response.ok) {
            const detail = await response.json().catch(() => ({})) as {statusCode?: string | number, code?: string, error?: string}
            if (response.status === 404 || String(detail.statusCode) === "404" || detail.code === "NoSuchKey" || detail.error === "not_found") {
                throw new ResponseError(404, "Stored file not found")
            }
            logger.error("Supabase Storage request failed", {status: response.status, code: detail.code})
            throw new ResponseError(502, "Storage request failed. Please retry.")
        }
        return response
    }

    static async save(name: string, buffer: Buffer, mime: string): Promise<void> {
        await this.request("/object/" + this.objectPath(name), "POST", buffer, mime)
    }

    static async read(name: string): Promise<Buffer> {
        const response = await this.request("/object/authenticated/" + this.objectPath(name))
        // Enforce the limit even if bucket settings are accidentally changed.
        const reader = response.body?.getReader()
        if (!reader) throw new ResponseError(502, "Storage returned an empty response")
        const chunks: Uint8Array[] = []
        let size = 0
        while (true) {
            const chunk = await reader.read()
            if (chunk.done) break
            size += chunk.value.byteLength
            if (size > 10 * 1024 * 1024) {
                await reader.cancel()
                throw new ResponseError(413, "Maximum file size is 10 MiB")
            }
            chunks.push(chunk.value)
        }
        return Buffer.concat(chunks)
    }

    static async remove(name: string): Promise<void> {
        this.objectPath(name)
        await this.request("/object/" + encodeURIComponent(this.config().bucket), "DELETE", JSON.stringify({prefixes: [name]}))
    }

    static async move(source: string, destination: string): Promise<void> {
        this.objectPath(source)
        this.objectPath(destination)
        await this.request("/object/move", "POST", JSON.stringify({
            bucketId: this.config().bucket, sourceKey: source, destinationKey: destination
        }))
    }

    static async signUpload(name: string): Promise<string> {
        const response = await this.request("/object/upload/sign/" + this.objectPath(name), "POST", "{}")
        const data = await response.json() as {url: string}
        return this.config().url + data.url
    }

    static async signDownload(name: string, filename: string): Promise<string> {
        const response = await this.request("/object/sign/" + this.objectPath(name), "POST", JSON.stringify({expiresIn: 60}))
        const data = await response.json() as {signedURL: string}
        const url = new URL(this.config().url + data.signedURL)
        url.searchParams.set("download", filename)
        return url.toString()
    }

    static async list(offset: number): Promise<{name: string, updated_at: string}[]> {
        const response = await this.request("/object/list/" + encodeURIComponent(this.config().bucket), "POST",
            JSON.stringify({prefix: "", limit: 100, offset, sortBy: {column: "name", order: "asc"}}))
        return response.json() as Promise<{name: string, updated_at: string}[]>
    }
}
