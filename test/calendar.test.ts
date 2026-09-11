import supertest from "supertest"
import {describe, it, expect, beforeEach, afterEach, afterAll} from "@jest/globals"
import {web} from "../src/application/web"
import {prismaClient} from "../src/application/db"
import {FileStorage} from "../src/application/fileStorage"
import {FeatureTest as BaseFeatureTest} from "./feature-util"
import {jest} from "@jest/globals"

class FeatureTest extends BaseFeatureTest {
    static scope = "calendar"
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


describe("calendar", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/calendar")
        .set("X-API-TOKEN", "wrong-calendar-token")
        .query({year: 2026, month: 9, category_id: data.category.id})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/calendar")
        .set("X-API-TOKEN", "calendar-staff-token")
        .query({year: 2026, month: 13, category_id: data.category.id})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/calendar")
        .set("X-API-TOKEN", "calendar-staff-token")
        .query({year: 2026, month: 9, category_id: data.category.id})

        expect(response.status).toBe(200)
        expect(response.body.data.events).toHaveLength(1)
        expect(response.body.data.events[0].activity_id).toBe(data.activity.id)
        expect(response.body.data.events[0].color).toBe("#3B82F6")
    })

})
