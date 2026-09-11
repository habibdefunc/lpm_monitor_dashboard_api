import supertest from "supertest"
import {describe, it, expect, beforeEach, afterEach, afterAll} from "@jest/globals"
import {web} from "../src/application/web"
import {prismaClient} from "../src/application/db"
import {FileStorage} from "../src/application/fileStorage"
import {FeatureTest as BaseFeatureTest} from "./feature-util"
import {jest} from "@jest/globals"

class FeatureTest extends BaseFeatureTest {
    static scope = "category"
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


describe("category-create", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/categories")
        .set("X-API-TOKEN", "wrong-category-token")
        .send({name: "__category_created_category__", description: "Created category"})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/categories")
        .set("X-API-TOKEN", "category-token")
        .send({name: "", description: "Created category"})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .post("/api/categories")
        .set("X-API-TOKEN", "category-token")
        .send({name: "__category_created_category__", description: "Created category"})

        expect(response.status).toBe(201)
        expect(response.body.data.name).toBe("__category_created_category__")
        expect(await prismaClient.category.findUnique({where: {id: response.body.data.id}})).not.toBeNull()
    })

})

describe("category-list", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/categories/current")
        .set("X-API-TOKEN", "wrong-category-token")
        .query({})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/categories/current")
        .set("X-API-TOKEN", "category-token")
        .query({unknown: "invalid"})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/categories/current")
        .set("X-API-TOKEN", "category-token")
        .query({})

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.data)).toBe(true)
        expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining({id: data.category.id})]))
    })

})

describe("category-get", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/categories/current/" + data.category.id)
        .set("X-API-TOKEN", "wrong-category-token")

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/categories/current/abc")
        .set("X-API-TOKEN", "category-token")

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/categories/current/" + data.category.id)
        .set("X-API-TOKEN", "category-token")

        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(data.category.id)
    })

})

describe("category-update", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/categories/current/" + data.category.id)
        .set("X-API-TOKEN", "wrong-category-token")
        .send({description: "Updated category"})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/categories/current/" + data.category.id)
        .set("X-API-TOKEN", "category-token")
        .send({description: ""})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .patch("/api/categories/current/" + data.category.id)
        .set("X-API-TOKEN", "category-token")
        .send({description: "Updated category"})

        expect(response.status).toBe(200)
        expect(response.body.data.description).toBe("Updated category")
    })

})

describe("category-delete", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/categories/current/" + data.unusedCategory.id)
        .set("X-API-TOKEN", "wrong-category-token")

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/categories/current/abc")
        .set("X-API-TOKEN", "category-token")

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .delete("/api/categories/current/" + data.unusedCategory.id)
        .set("X-API-TOKEN", "category-token")

        expect(response.status).toBe(200)
        expect(await prismaClient.category.findUnique({where: {id: data.unusedCategory.id}})).toBeNull()
    })

})
