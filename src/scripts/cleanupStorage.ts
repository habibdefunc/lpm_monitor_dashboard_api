import {SupabaseStorage} from "../application/supabaseStorage"
import {prismaClient} from "../application/db"

// Dry-run by default. Never touches recent files or pending-delete recovery files.
async function cleanup() {
    const apply = process.argv.includes("--apply")
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    const candidates: string[] = []
    for (let offset = 0; ; offset += 100) {
        const page = await SupabaseStorage.list(offset)
        for (const item of page) {
            if (!/^[0-9a-f-]{36}(\.upload)?\.(pdf|png|jpg)$/.test(item.name)) continue
            if (!(Date.parse(item.updated_at) < cutoff)) continue
            candidates.push(item.name)
        }
        if (page.length < 100) break
    }
    for (const name of candidates) {
        const document = await prismaClient.documentation.findFirst({where: {file_path: "supabase:" + name}})
        if (document) continue
        console.log(apply ? "Removing orphan:" : "Would remove orphan:", name)
        if (apply) await SupabaseStorage.remove(name)
    }
}

if (require.main === module) {
    cleanup().catch(() => {
        console.error("Storage cleanup failed. Check server environment and storage access.")
        process.exitCode = 1
    }).finally(() => prismaClient.$disconnect())
}
