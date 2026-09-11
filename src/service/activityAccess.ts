import {Activity, Prisma, User} from "@prisma/client"
import {prismaClient} from "../application/db"
import {ResponseError} from "../error/responseError"
import {ApiValidation} from "../validation/apiValidation"

export class ActivityAccess {
    static checkRole(user: User): void {
        if (user.role !== "ADMIN" && user.role !== "STAF") {
            throw new ResponseError(403, "Access denied")
        }
    }

    static filter(user: User): Prisma.ActivityWhereInput {
        this.checkRole(user)
        if (user.role === "STAF") {
            return {responsible_user_id: user.id}
        }
        return {}
    }

    static checkResponsible(user: User, id: number): void {
        this.checkRole(user)
        if (user.role === "STAF" && id !== user.id) {
            throw new ResponseError(403, "STAF can only manage their own activities")
        }
    }

    static async get(user: User, id: number, client: Prisma.TransactionClient = prismaClient): Promise<Activity> {
        this.checkRole(user)
        const activityId = ApiValidation.ID.parse(id)
        const activity = await client.activity.findUnique({
            where: {id: activityId}
        })
        if (!activity) {
            throw new ResponseError(404, "Activity not found")
        }
        if (user.role === "STAF" && activity.responsible_user_id !== user.id) {
            throw new ResponseError(403, "STAF can only manage their own activities")
        }
        return activity
    }

    static async lock(user: User, id: number, client: Prisma.TransactionClient): Promise<Activity> {
        const activityId = ApiValidation.ID.parse(id)
        await client.$queryRaw(Prisma.sql`SELECT id FROM activities WHERE id = ${activityId} FOR UPDATE`)
        return this.get(user, activityId, client)
    }
}
