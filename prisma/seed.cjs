const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prismaClient = new PrismaClient()

async function main(){
    const user = await prismaClient.user.findUnique({
        where: { username: "admin" }
    })

    if (user) {
        if (user.role !== "ADMIN" || user.email !== "admin@example.com") {
            throw new Error("Username belongs to a different account. Change the username in prisma/seed.cjs")
        }
        console.log("Admin account already exists. Password and account data were not changed.")
        return
    }

    const userWithSameEmail = await prismaClient.user.findUnique({
        where: { email: "admin@example.com" }
    })
    if (userWithSameEmail) {
        throw new Error("Email already exists. Change the email in prisma/seed.cjs")
    }

    await prismaClient.user.create({
        data: {
            username: "admin123",
            password: await bcrypt.hash("Admin123!", 10),
            name: "Administrator LPM",
            jenis_kel: "L",
            email: "admin@example.com",
            no_hp: "-",
            alamat: "-",
            role: "ADMIN"
        }
    })

    console.log("Admin account created successfully. Log in using the credentials configured in prisma/seed.cjs.")
}

main()
    .catch((error) => {
        if (error.code === "P2002") {
            console.error("Username or email already exists")
        } else if (error.name === "Error") {
            console.error(error.message)
        } else {
            console.error("Admin seed failed. Check the database connection and migrations.")
        }
        process.exitCode = 1
    })
    .finally(async () => {
        await prismaClient.$disconnect()
    })
