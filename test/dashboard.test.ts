import supertest from "supertest"
import {describe, it, expect, beforeEach, afterEach, afterAll} from "@jest/globals"
import {web} from "../src/application/web"
import {prismaClient} from "../src/application/db"
import {FileStorage} from "../src/application/fileStorage"
import {FeatureTest as BaseFeatureTest} from "./feature-util"
import {jest} from "@jest/globals"

class FeatureTest extends BaseFeatureTest {
    static scope = "dashboard"
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


describe("dashboard", ()=> {
    it("should reject if token is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/dashboard")
        .set("X-API-TOKEN", "wrong-dashboard-token")
        .query({year: 2026})

        expect(response.status).toBe(401)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if input is invalid", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/dashboard")
        .set("X-API-TOKEN", "dashboard-staff-token")
        .query({year: 0})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should be successful", async ()=> {
        const data = await FeatureTest.get()
        const response = await supertest(web)
        .get("/api/dashboard")
        .set("X-API-TOKEN", "dashboard-staff-token")
        .query({year: 2026})

        expect(response.status).toBe(200)
        expect(response.body.data.monthly_activities).toHaveLength(12)
        expect(response.body.data.summary.total).toBe(1)
        expect(response.body.data.monthly_activities[8].total).toBe(1)
    })

})
