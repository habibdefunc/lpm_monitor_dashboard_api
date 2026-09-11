import supertest from "supertest"
import {describe, it, expect, beforeEach, afterEach, afterAll} from "@jest/globals"
import {web} from "../src/application/web"
import {prismaClient} from "../src/application/db"
import {FileStorage} from "../src/application/fileStorage"
import {FeatureTest as BaseFeatureTest} from "./feature-util"
import {jest} from "@jest/globals"

class FeatureTest extends BaseFeatureTest {
    static scope = "documentation"
}

beforeEach(async ()=> {
    await FeatureTest.delete()
    await FeatureTest.create()
})

afterEach(async ()=> {
    jest.restoreAllMocks()
    await FeatureTest.delete()
})

afterAll(async ()=> {
    await prismaClient.$disconnect()
})


describe("documentation-upload", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/activities/" + data.activity.id + "/documentations")
        .set("X-API-TOKEN", "wrong-documentation-token")
        .attach("file", Buffer.from("%PDF-1.4\n%%EOF"), {filename: "upload.pdf", contentType: "application/pdf"})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/activities/" + data.activity.id + "/documentations")
        .set("X-API-TOKEN", "documentation-token")

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/activities/" + data.activity.id + "/documentations")
        .set("X-API-TOKEN", "documentation-token")
        .attach("file", Buffer.from("%PDF-1.4\n%%EOF"), {filename: "upload.pdf", contentType: "application/pdf"})

        expect(response.status).toBe(201)
        expect(response.body.data.activity_id).toBe(data.activity.id)
        expect(response.body.data.uploaded_by).toBe(data.admin.id)
        expect(response.body.data.file_path).toBeUndefined()
    })

})

describe("documentation-list", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/" + data.activity.id + "/documentations")
        .set("X-API-TOKEN", "wrong-documentation-token")
        .query({})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/" + data.activity.id + "/documentations")
        .set("X-API-TOKEN", "documentation-token")
        .query({unknown: "invalid"})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/" + data.activity.id + "/documentations")
        .set("X-API-TOKEN", "documentation-token")
        .query({})

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.data[0].id).toBe(data.document.id)
    })

})

describe("documentation-get", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/" + data.activity.id + "/documentations/" + data.document.id)
        .set("X-API-TOKEN", "wrong-documentation-token")

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/" + data.activity.id + "/documentations/abc")
        .set("X-API-TOKEN", "documentation-token")

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/" + data.activity.id + "/documentations/" + data.document.id)
        .set("X-API-TOKEN", "documentation-token")

        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(data.document.id)
        expect(response.body.data.file_path).toBeUndefined()
    })

})

describe("documentation-download", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/" + data.activity.id + "/documentations/" + data.document.id + "/download")
        .set("X-API-TOKEN", "wrong-documentation-token")

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/" + data.activity.id + "/documentations/abc/download")
        .set("X-API-TOKEN", "documentation-token")

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/" + data.activity.id + "/documentations/" + data.document.id + "/download")
        .set("X-API-TOKEN", "documentation-token")

        expect(response.status).toBe(200)
        expect(response.headers["content-type"]).toContain("application/pdf")
        expect(response.headers["content-disposition"]).toContain("attachment")
        expect(response.body).toEqual(Buffer.from("%PDF-1.4\n%%EOF"))
    })

})

describe("documentation-delete", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/activities/" + data.activity.id + "/documentations/" + data.document.id)
        .set("X-API-TOKEN", "wrong-documentation-token")

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/activities/" + data.activity.id + "/documentations/abc")
        .set("X-API-TOKEN", "documentation-token")

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/activities/" + data.activity.id + "/documentations/" + data.document.id)
        .set("X-API-TOKEN", "documentation-token")

        expect(response.status).toBe(200)
        expect(await prismaClient.documentation.findUnique({where: {id: data.document.id}})).toBeNull()
        await expect(FileStorage.read(data.document.file_path)).rejects.toMatchObject({code: "ENOENT"})
    })

})
