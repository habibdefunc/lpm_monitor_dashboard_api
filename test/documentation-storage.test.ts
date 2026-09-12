import supertest from "supertest"
import {describe, it, expect, beforeEach, afterEach, afterAll, jest} from "@jest/globals"
import {web} from "../src/application/web"
import {prismaClient} from "../src/application/db"
import {SupabaseStorage} from "../src/application/supabaseStorage"
import {FeatureTest as BaseFeatureTest} from "./feature-util"

class FeatureTest extends BaseFeatureTest {
    static scope = "documentation-storage"
}
const content = Buffer.from("%PDF-1.4\n%%EOF")

beforeEach(async () => {
    jest.spyOn(SupabaseStorage, "config").mockReturnValue({
        url: "https://storage.example.invalid/storage/v1", key: "test-only-signing-key", bucket: "documentations"
    })
    jest.spyOn(SupabaseStorage, "signUpload").mockResolvedValue("https://storage.example.invalid/signed-upload")
    jest.spyOn(SupabaseStorage, "read").mockResolvedValue(content)
    jest.spyOn(SupabaseStorage, "save").mockResolvedValue(undefined)
    jest.spyOn(SupabaseStorage, "remove").mockResolvedValue(undefined)
    jest.spyOn(SupabaseStorage, "signDownload").mockResolvedValue("https://storage.example.invalid/signed-download")
    await FeatureTest.delete()
    await FeatureTest.create()
})
afterEach(async () => {
    try { await FeatureTest.delete() } finally { jest.restoreAllMocks() }
})
afterAll(async () => { await prismaClient.$disconnect() })

async function prepare() {
    const data = await FeatureTest.get()
    const response = await supertest(web)
        .post("/api/activities/" + data.activity.id + "/documentations/upload-url")
        .set("X-API-TOKEN", "documentation-storage-token")
        .send({file_name: "cloud.pdf", mime_type: "application/pdf", size: content.length})
    expect(response.status).toBe(200)
    return {data, ticket: response.body.data.ticket as string}
}

describe("documentation signed upload", () => {
    it("should reject if token is invalid", async () => {
        const data = await FeatureTest.get()
        const response = await supertest(web)
            .post("/api/activities/" + data.activity.id + "/documentations/upload-url")
            .set("X-API-TOKEN", "wrong")
            .send({file_name: "cloud.pdf", mime_type: "application/pdf", size: content.length})
        expect(response.status).toBe(401)
        expect(SupabaseStorage.signUpload).not.toHaveBeenCalled()
    })
    it("should reject an oversized file before issuing upload access", async () => {
        const data = await FeatureTest.get()
        const response = await supertest(web)
            .post("/api/activities/" + data.activity.id + "/documentations/upload-url")
            .set("X-API-TOKEN", "documentation-storage-token")
            .send({file_name: "cloud.pdf", mime_type: "application/pdf", size: 10 * 1024 * 1024 + 1})
        expect(response.status).toBe(400)
        expect(SupabaseStorage.signUpload).not.toHaveBeenCalled()
    })
    it("should complete successfully and return the same record on retry", async () => {
        const {data, ticket} = await prepare()
        const send = () => supertest(web)
            .post("/api/activities/" + data.activity.id + "/documentations/complete")
            .set("X-API-TOKEN", "documentation-storage-token").send({ticket})
        const [first, second] = await Promise.all([send(), send()])
        expect(first.status).toBe(201)
        expect(second.status).toBe(201)
        expect(first.body.data.id).toBe(second.body.data.id)
        expect(first.body.data.file_path).toBeUndefined()
        expect(SupabaseStorage.save).toHaveBeenCalledTimes(1)
    })
    it("should reject a forged ticket", async () => {
        const {data, ticket} = await prepare()
        const response = await supertest(web)
            .post("/api/activities/" + data.activity.id + "/documentations/complete")
            .set("X-API-TOKEN", "documentation-storage-token").send({ticket: ticket + "x"})
        expect(response.status).toBe(400)
        expect(SupabaseStorage.read).not.toHaveBeenCalled()
    })
    it("should reject a ticket belonging to another user", async () => {
        const {data, ticket} = await prepare()
        const response = await supertest(web)
            .post("/api/activities/" + data.activity.id + "/documentations/complete")
            .set("X-API-TOKEN", "documentation-storage-staff-token").send({ticket})
        expect(response.status).toBe(403)
        expect(SupabaseStorage.read).not.toHaveBeenCalled()
    })
    it("should validate file contents before creating documentation", async () => {
        const {data, ticket} = await prepare()
        jest.mocked(SupabaseStorage.read).mockResolvedValue(Buffer.alloc(content.length, 65))
        const response = await supertest(web)
            .post("/api/activities/" + data.activity.id + "/documentations/complete")
            .set("X-API-TOKEN", "documentation-storage-token").send({ticket})
        expect(response.status).toBe(415)
        expect(SupabaseStorage.save).not.toHaveBeenCalled()
    })
    it("should recheck staff responsibility when completing", async () => {
        const data = await FeatureTest.get()
        const prepared = await supertest(web)
            .post("/api/activities/" + data.activity.id + "/documentations/upload-url")
            .set("X-API-TOKEN", "documentation-storage-staff-token")
            .send({file_name: "cloud.pdf", mime_type: "application/pdf", size: content.length})
        expect(prepared.status).toBe(200)
        await prismaClient.activity.update({where: {id: data.activity.id}, data: {responsible_user_id: data.admin.id}})
        const response = await supertest(web)
            .post("/api/activities/" + data.activity.id + "/documentations/complete")
            .set("X-API-TOKEN", "documentation-storage-staff-token").send({ticket: prepared.body.data.ticket})
        expect(response.status).toBe(403)
        expect(SupabaseStorage.read).not.toHaveBeenCalled()
    })
    it("should provide a private download link only after checking access", async () => {
        const {data, ticket} = await prepare()
        const completed = await supertest(web)
            .post("/api/activities/" + data.activity.id + "/documentations/complete")
            .set("X-API-TOKEN", "documentation-storage-token").send({ticket})
        expect(completed.status).toBe(201)
        const route = "/api/activities/" + data.activity.id + "/documentations/" + completed.body.data.id + "/download-url"
        const denied = await supertest(web).get(route).set("X-API-TOKEN", "wrong")
        expect(denied.status).toBe(401)
        expect(SupabaseStorage.signDownload).not.toHaveBeenCalled()
        const response = await supertest(web).get(route).set("X-API-TOKEN", "documentation-storage-token")
        expect(response.status).toBe(200)
        expect(response.body.data.expires_in).toBe(60)
        expect(response.headers["cache-control"]).toBe("private, no-store")
    })
})
