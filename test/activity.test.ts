import supertest from "supertest"
import {describe, it, expect, beforeEach, afterEach, afterAll} from "@jest/globals"
import {web} from "../src/application/web"
import {prismaClient} from "../src/application/db"
import {FileStorage} from "../src/application/fileStorage"
import {FeatureTest as BaseFeatureTest} from "./feature-util"
import {jest} from "@jest/globals"

class FeatureTest extends BaseFeatureTest {
    static scope = "activity"
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


describe("activity-create", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/activities")
        .set("X-API-TOKEN", "wrong-activity-token")
        .send({name: "Created activity", start_date: "2026-09-15", end_date: "2026-09-17", category_id: data.category.id, responsible_user_id: data.staff.id})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/activities")
        .set("X-API-TOKEN", "activity-token")
        .send({name: "", start_date: "2026-09-15", end_date: "2026-09-17", category_id: data.category.id, responsible_user_id: data.staff.id})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/activities")
        .set("X-API-TOKEN", "activity-token")
        .send({name: "Created activity", start_date: "2026-09-15", end_date: "2026-09-17", category_id: data.category.id, responsible_user_id: data.staff.id})

        expect(response.status).toBe(201)
        expect(response.body.data.responsible_user_id).toBe(data.staff.id)
        expect(response.body.data.status).toBe("DIRENCANAKAN")
    })

})

describe("activity-list", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/current")
        .set("X-API-TOKEN", "wrong-activity-token")
        .query({category_id: data.category.id, page: 1})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/current")
        .set("X-API-TOKEN", "activity-token")
        .query({category_id: data.category.id, page: 0})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/current")
        .set("X-API-TOKEN", "activity-token")
        .query({category_id: data.category.id, page: 1})

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.paging.total_items).toBe(1)
    })

})

describe("activity-get", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/current/" + data.activity.id)
        .set("X-API-TOKEN", "wrong-activity-token")

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/current/abc")
        .set("X-API-TOKEN", "activity-token")

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/activities/current/" + data.activity.id)
        .set("X-API-TOKEN", "activity-token")

        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(data.activity.id)
    })

})

describe("activity-update", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/activities/current/" + data.activity.id)
        .set("X-API-TOKEN", "wrong-activity-token")
        .send({name: "Updated activity", description: null})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/activities/current/" + data.activity.id)
        .set("X-API-TOKEN", "activity-token")
        .send({})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/activities/current/" + data.activity.id)
        .set("X-API-TOKEN", "activity-token")
        .send({name: "Updated activity", description: null})

        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe("Updated activity")
        expect(response.body.data.description).toBeNull()
        expect(response.body.data.start_date).toBe("2026-09-15")
    })

})

describe("activity-status", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/activities/current/" + data.activity.id + "/status")
        .set("X-API-TOKEN", "wrong-activity-token")
        .send({status: "BERJALAN"})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/activities/current/" + data.activity.id + "/status")
        .set("X-API-TOKEN", "activity-token")
        .send({status: "OTHER"})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/activities/current/" + data.activity.id + "/status")
        .set("X-API-TOKEN", "activity-token")
        .send({status: "BERJALAN"})

        expect(response.status).toBe(200)
        expect(response.body.data.status).toBe("BERJALAN")
    })

})

describe("activity-delete", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/activities/current/" + data.activity.id)
        .set("X-API-TOKEN", "wrong-activity-token")

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/activities/current/abc")
        .set("X-API-TOKEN", "activity-token")

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/activities/current/" + data.activity.id)
        .set("X-API-TOKEN", "activity-token")

        expect(response.status).toBe(200)
        expect(await prismaClient.activity.findUnique({where: {id: data.activity.id}})).toBeNull()
        expect(await prismaClient.documentation.findUnique({where: {id: data.document.id}})).toBeNull()
        await expect(FileStorage.read(data.document.file_path)).rejects.toMatchObject({code: "ENOENT"})
    })

})
