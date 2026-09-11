import supertest from "supertest"
import {describe, it, expect, beforeEach, afterEach, afterAll} from "@jest/globals"
import {web} from "../src/application/web"
import {prismaClient} from "../src/application/db"
import {FileStorage} from "../src/application/fileStorage"
import {FeatureTest as BaseFeatureTest} from "./feature-util"
import {DocumentationService} from "../src/service/documentationService"
import {jest} from "@jest/globals"

class FeatureTest extends BaseFeatureTest {
    static scope = "relations"
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


describe("feature relations and access", ()=> {
    it("should reject STAF writes to categories", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/categories")
        .set("X-API-TOKEN", "relations-staff-token")
        .send({name: "Forbidden category", description: "test"})
        expect(response.status).toBe(403)
        expect((await supertest(web)
            .patch("/api/categories/current/" + data.category.id)
            .set("X-API-TOKEN", "relations-staff-token")
            .send({description: "Forbidden"})).status).toBe(403)
        expect((await supertest(web)
            .delete("/api/categories/current/" + data.unusedCategory.id)
            .set("X-API-TOKEN", "relations-staff-token")).status).toBe(403)
    })

    it("should reject deleting a category that is still used", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/categories/current/" + data.category.id)
        .set("X-API-TOKEN", "relations-token")
        expect(response.status).toBe(409)
        expect(await prismaClient.activity.findUnique({where: {id: data.activity.id}})).not.toBeNull()
    })

    it("should reject duplicate category names", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/categories")
        .set("X-API-TOKEN", "relations-token")
        .send({name: "__relations_category__", description: "duplicate"})
        expect(response.status).toBe(409)
        expect((await supertest(web)
            .patch("/api/categories/current/" + data.unusedCategory.id)
            .set("X-API-TOKEN", "relations-token")
            .send({name: "__relations_category__"})).status).toBe(409)
    })

    it("should allow STAF to create their own activity only", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/activities")
        .set("X-API-TOKEN", "relations-staff-token")
        .send({
            name: "Own activity", start_date: "2026-09-15", end_date: "2026-09-17",
            category_id: data.category.id, responsible_user_id: data.staff.id
        })
        expect(response.status).toBe(201)
        expect((await supertest(web)
            .post("/api/activities")
            .set("X-API-TOKEN", "relations-staff-token")
            .send({
                name: "Forbidden activity", start_date: "2026-09-15", end_date: "2026-09-17",
                category_id: data.category.id, responsible_user_id: data.admin.id
            })).status).toBe(403)
    })

    it("should reject invalid references on activity create", async ()=> {
        const data = await FeatureTest.get()
        await prismaClient.category.delete({where: {id: data.unusedCategory.id}})
        const response = await supertest(web)
        .post("/api/activities")
        .set("X-API-TOKEN", "relations-token")
        .send({
            name: "Invalid category", start_date: "2026-09-15", end_date: "2026-09-17",
            category_id: data.unusedCategory.id, responsible_user_id: data.staff.id
        })
        expect(response.status).toBe(400)
        expect(response.body.errors).toBe("Category not found")

        expect(await prismaClient.user.findUnique({where: {id: 2147483647}})).toBeNull()
        const userResponse = await supertest(web)
        .post("/api/activities")
        .set("X-API-TOKEN", "relations-token")
        .send({
            name: "Invalid user", start_date: "2026-09-15", end_date: "2026-09-17",
            category_id: data.category.id, responsible_user_id: 2147483647
        })
        expect(userResponse.status).toBe(400)
        expect(userResponse.body.errors).toBe("Responsible user not found")
    })

    it("should reject invalid dates and partial date ranges", async ()=> {
        const data = await FeatureTest.get()
        expect((await supertest(web)
            .patch("/api/activities/current/" + data.activity.id)
            .set("X-API-TOKEN", "relations-token")
            .send({end_date: "2026-09-14"})).status).toBe(400)
        expect((await supertest(web)
            .patch("/api/activities/current/" + data.activity.id)
            .set("X-API-TOKEN", "relations-token")
            .send({start_date: "2026-02-30"})).status).toBe(400)
    })

    it("should restrict list, dashboard, calendar and files after reassignment", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/activities/current/" + data.activity.id)
        .set("X-API-TOKEN", "relations-token")
        .send({responsible_user_id: data.admin.id})
        expect(response.status).toBe(200)

        expect((await supertest(web)
            .get("/api/activities/current/" + data.activity.id)
            .set("X-API-TOKEN", "relations-staff-token")).status).toBe(403)
        expect((await supertest(web)
            .get("/api/activities/" + data.activity.id + "/documentations/" + data.document.id + "/download")
            .set("X-API-TOKEN", "relations-staff-token")).status).toBe(403)
        expect((await supertest(web)
            .get("/api/activities/current")
            .set("X-API-TOKEN", "relations-staff-token")).body.data).toEqual([])
        expect((await supertest(web)
            .get("/api/dashboard")
            .set("X-API-TOKEN", "relations-staff-token")).body.data.summary.total).toBe(0)
        expect((await supertest(web)
            .get("/api/calendar")
            .set("X-API-TOKEN", "relations-staff-token")
            .query({year: 2026, month: 9})).body.data.events).toEqual([])
    })

    it("should reject STAF changing the responsible user or widening filters", async ()=> {
        const data = await FeatureTest.get()
        expect((await supertest(web)
            .patch("/api/activities/current/" + data.activity.id)
            .set("X-API-TOKEN", "relations-staff-token")
            .send({responsible_user_id: data.admin.id})).status).toBe(403)
        expect((await supertest(web)
            .get("/api/activities/current")
            .set("X-API-TOKEN", "relations-staff-token")
            .query({responsible_user_id: data.admin.id})).status).toBe(403)
        expect((await supertest(web)
            .get("/api/calendar")
            .set("X-API-TOKEN", "relations-staff-token")
            .query({responsible_user_id: data.admin.id})).status).toBe(403)
    })

    it("should filter overlapping dates and retain paging totals", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/current")
        .set("X-API-TOKEN", "relations-staff-token")
        .query({
            search: "__relations_", start_date: "2026-09-16", end_date: "2026-09-16",
            category_id: data.category.id, status: "DIRENCANAKAN", size: 1, page: 1
        })
        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.paging.total_items).toBe(1)
        const pageResponse = await supertest(web)
        .get("/api/activities/current")
        .set("X-API-TOKEN", "relations-staff-token")
        .query({size: 1, page: 2})
        expect(pageResponse.body.data).toEqual([])
        expect(pageResponse.body.paging.total_items).toBe(1)
    })

    it("should not read documentation through a different activity", async ()=> {
        const data = await FeatureTest.get()
        const activity = await prismaClient.activity.create({
            data: {
                name: "Other activity", category_id: data.category.id,
                responsible_user_id: data.staff.id, status: "DIRENCANAKAN",
                start_date: new Date("2026-09-01T00:00:00.000Z"),
                end_date: new Date("2026-09-01T00:00:00.000Z")
            }
        })
        const response = await supertest(web)
        .get("/api/activities/" + activity.id + "/documentations/" + data.document.id)
        .set("X-API-TOKEN", "relations-staff-token")
        expect(response.status).toBe(404)
    })

    it("should reject unsupported files and files larger than 10 MiB", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/activities/" + data.activity.id + "/documentations")
        .set("X-API-TOKEN", "relations-token")
        .attach("file", Buffer.from("not a PDF"), {filename: "fake.pdf", contentType: "application/pdf"})
        expect(response.status).toBe(415)

        const largeResponse = await supertest(web)
        .post("/api/activities/" + data.activity.id + "/documentations")
        .set("X-API-TOKEN", "relations-token")
        .attach("file", Buffer.alloc(10 * 1024 * 1024 + 1), {filename: "large.pdf", contentType: "application/pdf"})
        expect(largeResponse.status).toBe(413)
    })

    it("should restore a file if deleting its metadata fails", async ()=> {
        const data = await FeatureTest.get()
        const originalDelete = prismaClient.$transaction.bind(prismaClient)
        jest.spyOn(prismaClient, "$transaction").mockImplementationOnce(async (callback: any) => {
            return originalDelete(async (transaction) => {
                return callback(new Proxy(transaction, {
                    get(target, property) {
                        if (property === "documentation") {
                            return new Proxy(target.documentation, {
                                get(delegate, method) {
                                    if (method === "delete") {
                                        return async () => { throw new Error("Simulated database failure") }
                                    }
                                    return Reflect.get(delegate, method)
                                }
                            })
                        }
                        return Reflect.get(target, property)
                    }
                }))
            })
        })
        await expect(DocumentationService.delete(data.admin, data.activity.id, data.document.id))
            .rejects.toThrow("Simulated database failure")
        expect(await FileStorage.read(data.document.file_path)).toEqual(Buffer.from("%PDF-1.4\n%%EOF"))
        expect(await prismaClient.documentation.findUnique({where: {id: data.document.id}})).not.toBeNull()
    })
})

