import {prismaClient} from "../src/application/db"
import bcrypt from "bcrypt"
import {User} from "@prisma/client"

export class UserTest{
    static async delete(email: string = "test"){
        await prismaClient.user.deleteMany({
            where: {
                email: email
            }
        })
    }

    static async create(username: string = "test", email: string = "test", token: string = "test", role: string = "ADMIN"){
        await prismaClient.user.create({
          data: {
            username: username,
            password: await bcrypt.hash("test", 10),
            name: "test",
            jenis_kel: "test",
            email: email,
            no_hp: "test",
            alamat: "test",
            role: role,
            token: token
          }
        })
    }

    static async get(email: string = "test"): Promise<User>{
        const user =  await prismaClient.user.findFirst({
          where: {
            email: email
          }
        })
        if(!user){
            throw new Error("User not found")
        }
        return user
    }
}
