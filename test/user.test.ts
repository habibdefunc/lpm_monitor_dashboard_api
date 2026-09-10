import supertest from "supertest"
import { describe, expect, it, beforeEach, afterEach, afterAll} from "@jest/globals"
import {web} from "../src/application/web"
import {logger} from "../src/application/logging"
import { UserTest } from "./test-util"
import { prismaClient } from "../src/application/db"
import bcrypt from "bcrypt"



describe('POST /api/users/login', ()=> {

    beforeEach(async ()=> {
        await UserTest.delete()
        await UserTest.create()
    })

    afterAll(async ()=> {
        await prismaClient.$disconnect()
    })

    afterEach(async ()=> {
        await UserTest.delete()
    })
    
    it('should be able to login', async ()=> {
        const response = await supertest(web)
        .post("/api/users/login")
        .send({
            username: "test",
            password: "test",
        })

    logger.debug(response.body)
    expect(response.status).toBe(200)
    expect(response.body.data.username).toBe("test")
    expect(response.body.data.name).toBe("test")
    expect(response.body.data.jenis_kel).toBe("test")
    expect(response.body.data.email).toBe("test")
    expect(response.body.data.no_hp).toBe("test")
    expect(response.body.data.alamat).toBe("test")
    expect(response.body.data.role).toBe("ADMIN")
     expect(response.body.data.token).toBeDefined()
    })

    it('should be reject if username is wrong', async ()=> {
        const response = await supertest(web)
        .post("/api/users/login")
        .send({
            username: "test2",
            password: "test",
        })

    logger.debug(response.body)
    expect(response.status).toBe(401)
     expect(response.body.errors).toBeDefined()
    })

    it('should be reject if password is wrong', async ()=> {
        const response = await supertest(web)
        .post("/api/users/login")
        .send({
            username: "test",
            password: "test2",
        })

    logger.debug(response.body)
    expect(response.status).toBe(401)
     expect(response.body.errors).toBeDefined()
    })

})

describe('POST /api/users', ()=> {

    beforeEach(async ()=> {
        await UserTest.delete()
        await prismaClient.user.deleteMany({
            where: { email: "test_create_user@example.com" }
        })
        await UserTest.create()
    })

    afterAll(async ()=> {
        await prismaClient.$disconnect()
    })

    afterEach(async ()=> {
        await UserTest.delete()
        await prismaClient.user.deleteMany({
            where: { email: "test_create_user@example.com" }
        })
    })
    
    it('should be reject register new user if token is invalid ', async ()=> {
        const response = await supertest(web)
        .post("/api/users")
        .set("X-API-TOKEN", "test2")
        .send({
            username: "test",
            password: "test",
            name: "test",
            jenis_kel: "L",
            email: "test",
            no_hp: "0046456456",
            alamat: "fghfgh",
            role: "STAF"
        })
    logger.debug(response.body)
    expect(response.status).toBe(401)
    expect(response.body.errors).toBeDefined()
    })

    it('should reject register new user if request is invalid', async ()=> {
        const response = await supertest(web)
        .post("/api/users")
        .set("X-API-TOKEN", "test")
        .send({
            username: "",
            password: "",
            name: "",
            jenis_kel: "",
            email: "",
            no_hp: "",
            alamat: "",
            role: ""
        })

    logger.debug(response.body)
    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
    })

    it('should  register new user ', async ()=> {
        const response = await supertest(web)
        .post("/api/users")
        .set("X-API-TOKEN", "test")
        .send({
            username: "test_create_user",
            password: "test",
            name: "test",
            jenis_kel: "L",
            email: "test_create_user@example.com",
            no_hp: "0046456456",
            alamat: "fghfgh",
            role: "STAF"
        })
    logger.debug(response.body)
    expect(response.status).toBe(201)
    expect(response.body.data.username).toBe("test_create_user")
    expect(response.body.data.name).toBe("test")
    expect(response.body.data.jenis_kel).toBe("L")
    expect(response.body.data.email).toBe("test_create_user@example.com")
    expect(response.body.data.no_hp).toBe("0046456456")
    expect(response.body.data.alamat).toBe("fghfgh")
    expect(response.body.data.role).toBe("STAF")
    })
})

describe('GET /api/users/current', ()=> {

    beforeEach(async ()=> {
        await UserTest.delete()
        await UserTest.create()
    })

    afterAll(async ()=> {
        await prismaClient.$disconnect()
    })

    afterEach(async ()=> {
        await UserTest.delete()
    })
    
    it('should be able to get user', async ()=> {
        const response = await supertest(web)
        .get("/api/users/current")
        .set("X-API-TOKEN", "test")

    logger.debug(response.body)
    expect(response.status).toBe(200)
    expect(response.body.data.username).toBe("test")
    expect(response.body.data.name).toBe("test")
    expect(response.body.data.jenis_kel).toBe("test")
    expect(response.body.data.email).toBe("test")
    expect(response.body.data.no_hp).toBe("test")
    expect(response.body.data.alamat).toBe("test")
    expect(response.body.data.role).toBe("ADMIN")
    })

    it('should be reject to get user if token is invalid', async ()=> {
        const response = await supertest(web)
          .get("/api/users/current")
        .set("X-API-TOKEN", "test2")

    logger.debug(response.body)
    expect(response.status).toBe(401)
     expect(response.body.errors).toBeDefined()
    })


})

describe('PATCH /api/users/current', ()=> {

    beforeEach(async ()=> {
        await UserTest.delete()
        await UserTest.create()
    })

    afterAll(async ()=> {
        await prismaClient.$disconnect()
    })

    afterEach(async ()=> {
        await UserTest.delete()
    })

    it('should be reject to update user if request is invalid', async ()=> {
        const response = await supertest(web)
        .patch("/api/users/current")
        .set("X-API-TOKEN", "test")
        .send({
            username: "",
            password: "",
        })

    logger.debug(response.body)
    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
    })

     it('should be reject to update user if token is invalid', async ()=> {
        const response = await supertest(web)
        .patch("/api/users/current")
        .set("X-API-TOKEN", "test3")
        .send({
            username: "dedek",
            password: "dedek",
        })

    logger.debug(response.body)
    expect(response.status).toBe(401)
    expect(response.body.errors).toBeDefined()
    })

    it('should be able to update user username', async ()=> {
        const response = await supertest(web)
        .patch("/api/users/current")
        .set("X-API-TOKEN", "test")
        .send({
            username: "test_updated_username",
        })

    logger.debug(response.body)
    expect(response.status).toBe(200)
    expect(response.body.data.username).toBe("test_updated_username")

    const user = await UserTest.get()
    expect(user.username).toBe("test_updated_username")

    })

    it('should be able to update user password', async ()=> {
        const response = await supertest(web)
        .patch("/api/users/current")
        .set("X-API-TOKEN", "test")
        .send({
            password: "dedek",
        })
    logger.debug(response.body)
    expect(response.status).toBe(200)
    const user = await UserTest.get()
    expect(await bcrypt.compare("dedek", user.password)).toBe(true)
    })

    

})

describe('DELETE /api/users/current', ()=> {

    beforeEach(async ()=> {
        await UserTest.delete()
        await UserTest.create()
    })

    afterAll(async ()=> {
        await prismaClient.$disconnect()
    })

    afterEach(async ()=> {
        await UserTest.delete()
    })

    it('should be able to update logout', async ()=> {
        const response = await supertest(web)
        .delete("/api/users/current")
        .set("X-API-TOKEN", "test")

    logger.debug(response.body)
    expect(response.status).toBe(200)
    expect(response.body.data).toBe("OK")
    const user = await UserTest.get()
    expect(user.token).toBeNull()
    })

     it('should be reject to logout user if token is wrong', async ()=> {
        const response = await supertest(web)
        .delete("/api/users/current")
        .set("X-API-TOKEN", "test3")

    logger.debug(response.body)
    expect(response.status).toBe(401)
    expect(response.body.errors).toBeDefined()
    })   

})


describe('DELETE /api/users/:id', ()=> {

    beforeEach(async ()=> {
        await UserTest.delete("test_delete_target@example.com")
        await UserTest.delete()
        await UserTest.create()
        await UserTest.create("test_delete_target", "test_delete_target@example.com", "target-token", "STAF")
    })

    afterAll(async ()=> {
        await prismaClient.$disconnect()
    })

    afterEach(async ()=> {
        await UserTest.delete("test_delete_target@example.com")
        await UserTest.delete()
    })

    it('should be able delete user', async ()=> {
        const user = await UserTest.get("test_delete_target@example.com")
        const response = await supertest(web)
        .delete(`/api/users/${user.id}`)
        .set("X-API-TOKEN", "test")

        logger.debug(response.body)
        expect(response.status).toBe(200)
        expect(response.body.data.username).toBe("test_delete_target")
        expect(response.body.data.email).toBe("test_delete_target@example.com")
        expect(await prismaClient.user.findUnique({where: {id: user.id}})).toBeNull()
        expect((await UserTest.get()).token).toBe("test")
    })

    it('should be reject delete user if id is invalid', async ()=> {
        const response = await supertest(web)
        .delete("/api/users/abc")
        .set("X-API-TOKEN", "test")

        logger.debug(response.body)
        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
        expect((await UserTest.get("test_delete_target@example.com")).username).toBe("test_delete_target")
    })
})


describe('User API rules', ()=> {
    beforeEach(async ()=> {
        await UserTest.delete("test_other@example.com")
        await UserTest.delete()
        await UserTest.create()
        await UserTest.create("test_other", "test_other@example.com", "other-token", "STAF")
    })

    afterEach(async ()=> {
        await UserTest.delete("test_other@example.com")
        await UserTest.delete()
    })

    afterAll(async ()=> {
        await prismaClient.$disconnect()
    })

    it('should reject STAF access to user management', async ()=> {
        const user = await UserTest.get()
        expect((await supertest(web).post("/api/users").set("X-API-TOKEN", "other-token").send({})).status).toBe(403)
        expect((await supertest(web).get("/api/users").set("X-API-TOKEN", "other-token")).status).toBe(403)
        expect((await supertest(web).patch(`/api/users/${user.id}`).set("X-API-TOKEN", "other-token").send({role: "ADMIN"})).status).toBe(403)
        expect((await supertest(web).delete(`/api/users/${user.id}`).set("X-API-TOKEN", "other-token")).status).toBe(403)
    })

    it('should reject duplicate username on create', async ()=> {
        const response = await supertest(web).post("/api/users").set("X-API-TOKEN", "test")
        .send({username: "test", password: "test", name: "test", jenis_kel: "L", email: "test_other@example.com", no_hp: "081234567890", alamat: "test", role: "STAF"})
        expect(response.status).toBe(409)
        expect(response.body.errors).toBeDefined()
    })

    it('should reject duplicate email on create', async ()=> {
        const response = await supertest(web).post("/api/users").set("X-API-TOKEN", "test")
        .send({username: "test_duplicate_email", password: "test", name: "test", jenis_kel: "L", email: "test_other@example.com", no_hp: "081234567890", alamat: "test", role: "STAF"})
        expect(response.status).toBe(409)
    })

    it('should reject empty update and body id', async ()=> {
        expect((await supertest(web).patch("/api/users/current").set("X-API-TOKEN", "test").send({})).status).toBe(400)
        expect((await supertest(web).patch("/api/users/current").set("X-API-TOKEN", "test").send({id: 1})).status).toBe(400)
    })

    it('should reject duplicate fields on update', async ()=> {
        expect((await supertest(web).patch("/api/users/current").set("X-API-TOKEN", "test").send({username: "test_other"})).status).toBe(409)
        expect((await supertest(web).patch("/api/users/current").set("X-API-TOKEN", "test").send({email: "test_other@example.com"})).status).toBe(409)
    })

    it('should allow unchanged unique fields and return id', async ()=> {
        const user = await UserTest.get()
        const response = await supertest(web).patch("/api/users/current").set("X-API-TOKEN", "test")
        .send({username: "test", email: "test"})
        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(user.id)
        expect(response.body.data.password).toBeUndefined()
    })

    it('should reject an unsupported role', async ()=> {
        const response = await supertest(web).patch("/api/users/current").set("X-API-TOKEN", "test").send({role: "other"})
        expect(response.status).toBe(400)
    })

    it('should reject deleting the signed in user', async ()=> {
        const user = await UserTest.get()
        const response = await supertest(web).delete(`/api/users/${user.id}`).set("X-API-TOKEN", "test")
        expect(response.status).toBe(409)
        expect(response.body.errors).toBe("You cannot delete your own account")
    })

    it('should invalidate the old token after login and logout', async ()=> {
        const response = await supertest(web).post("/api/users/login").send({username: "test", password: "test"})
        expect(response.status).toBe(200)
        expect((await supertest(web).get("/api/users/current").set("X-API-TOKEN", "test")).status).toBe(401)
        expect((await supertest(web).delete("/api/users/current").set("X-API-TOKEN", response.body.data.token)).status).toBe(200)
        expect((await supertest(web).get("/api/users/current").set("X-API-TOKEN", response.body.data.token)).status).toBe(401)
        expect((await UserTest.get()).token).toBeNull()
    })

    it('should allow STAF to get and update current profile', async ()=> {
        const user = await UserTest.get("test_other@example.com")
        const response = await supertest(web)
        .get("/api/users/current")
        .set("X-API-TOKEN", "other-token")
        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(user.id)

        const updateResponse = await supertest(web)
        .patch("/api/users/current")
        .set("X-API-TOKEN", "other-token")
        .send({name: "Updated profile"})
        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body.data.name).toBe("Updated profile")
        expect(updateResponse.body.data.role).toBe("STAF")
        expect((await UserTest.get()).name).toBe("test")
    })

    it('should reject role changes through current profile for all roles', async ()=> {
        expect((await supertest(web).patch("/api/users/current").set("X-API-TOKEN", "other-token").send({role: "ADMIN"})).status).toBe(400)
        expect((await supertest(web).patch("/api/users/current").set("X-API-TOKEN", "test").send({role: "STAF"})).status).toBe(400)
        expect((await UserTest.get("test_other@example.com")).role).toBe("STAF")
    })

    it('should allow ADMIN to get all users and user by id', async ()=> {
        const user = await UserTest.get("test_other@example.com")
        const response = await supertest(web)
        .get("/api/users")
        .set("X-API-TOKEN", "test")
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.data)).toBe(true)
        expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining({id: user.id})]))
        for (const item of response.body.data) {
            expect(item.password).toBeUndefined()
            expect(item.token).toBeUndefined()
        }
        const detailResponse = await supertest(web)
        .get(`/api/users/${user.id}`)
        .set("X-API-TOKEN", "test")
        expect(detailResponse.status).toBe(200)
        expect(detailResponse.body.data.id).toBe(user.id)
        expect((await supertest(web).get(`/api/users/${user.id}`).set("X-API-TOKEN", "other-token")).status).toBe(403)
    })

    it('should allow ADMIN to update another user including role', async ()=> {
        const user = await UserTest.get("test_other@example.com")
        const response = await supertest(web)
        .patch(`/api/users/${user.id}`)
        .set("X-API-TOKEN", "test")
        .send({name: "Updated user", role: "ADMIN", password: "changed-password"})
        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(user.id)
        expect(response.body.data.role).toBe("ADMIN")
        expect(response.body.data.password).toBeUndefined()
        expect(await bcrypt.compare("changed-password", (await UserTest.get("test_other@example.com")).password)).toBe(true)
        expect((await UserTest.get()).name).toBe("test")
    })

    it('should validate admin target id and missing user', async ()=> {
        expect((await supertest(web).get("/api/users/abc").set("X-API-TOKEN", "test")).status).toBe(400)
        expect((await supertest(web).patch("/api/users/0").set("X-API-TOKEN", "test").send({name: "test"})).status).toBe(400)
        const user = await UserTest.get("test_other@example.com")
        await UserTest.delete("test_other@example.com")
        expect((await supertest(web).get(`/api/users/${user.id}`).set("X-API-TOKEN", "test")).status).toBe(404)
        expect((await supertest(web).patch(`/api/users/${user.id}`).set("X-API-TOKEN", "test").send({name: "test"})).status).toBe(404)
    })

    it('should reject invalid and conflicting admin updates', async ()=> {
        const user = await UserTest.get("test_other@example.com")
        expect((await supertest(web).patch(`/api/users/${user.id}`).set("X-API-TOKEN", "test").send({})).status).toBe(400)
        expect((await supertest(web).patch(`/api/users/${user.id}`).set("X-API-TOKEN", "test").send({role: "other"})).status).toBe(400)
        expect((await supertest(web).patch(`/api/users/${user.id}`).set("X-API-TOKEN", "test").send({email: "test"})).status).toBe(409)
        expect((await supertest(web).get("/api/users")).status).toBe(401)
    })
})
