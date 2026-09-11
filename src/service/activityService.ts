import {Prisma, User} from "@prisma/client"
import {prismaClient} from "../application/db"
import {FileStorage} from "../application/fileStorage"
import {ResponseError} from "../error/responseError"
import {ActivityAccess} from "./activityAccess"
import {ActivityValidation} from "../validation/activityValidation"
import {
    CreateActivityRequest, UpdateActivityRequest, UpdateActivityStatusRequest,
    ActivityResponse, ActivityListResponse, toActivityResponse
} from "../model/activityModel"

export class ActivityService {
    static async create(user: User, request: CreateActivityRequest): Promise<ActivityResponse> {
        const createRequest = ActivityValidation.CREATE.parse(request)
        ActivityAccess.checkResponsible(user, createRequest.responsible_user_id)

        const category = await prismaClient.category.findUnique({
            where: {id: createRequest.category_id}
        })
        if (!category) {
            throw new ResponseError(400, "Category not found")
        }
        const responsibleUser = await prismaClient.user.findUnique({
            where: {id: createRequest.responsible_user_id}
        })
        if (!responsibleUser) {
            throw new ResponseError(400, "Responsible user not found")
        }
        const activity = await prismaClient.activity.create({
            data: {
                name: createRequest.name,
                description: createRequest.description ?? null,
                start_date: new Date(createRequest.start_date + "T00:00:00.000Z"),
                end_date: new Date(createRequest.end_date + "T00:00:00.000Z"),
                category_id: createRequest.category_id,
                responsible_user_id: createRequest.responsible_user_id,
                status: createRequest.status
            }
        })
        return toActivityResponse(activity)
    }

    static async getAll(user: User, request: unknown): Promise<ActivityListResponse> {
        const listRequest = ActivityValidation.LIST.parse(request)
        const where: Prisma.ActivityWhereInput = ActivityAccess.filter(user)

        if (listRequest.responsible_user_id !== undefined) {
            ActivityAccess.checkResponsible(user, listRequest.responsible_user_id)
            where.responsible_user_id = listRequest.responsible_user_id
        }
        if (listRequest.search !== undefined) {
            where.name = {contains: listRequest.search}
        }
        if (listRequest.category_id !== undefined) {
            where.category_id = listRequest.category_id
        }
        if (listRequest.status !== undefined) {
            where.status = listRequest.status
        }
        if (listRequest.start_date !== undefined) {
            where.end_date = {gte: new Date(listRequest.start_date + "T00:00:00.000Z")}
        }
        if (listRequest.end_date !== undefined) {
            where.start_date = {lte: new Date(listRequest.end_date + "T00:00:00.000Z")}
        }
        const [totalItems, activities] = await prismaClient.$transaction([
            prismaClient.activity.count({where: where}),
            prismaClient.activity.findMany({
                where: where,
                orderBy: {id: "desc"},
                skip: (listRequest.page - 1) * listRequest.size,
                take: listRequest.size
            })
        ])
        return {
            data: activities.map(toActivityResponse),
            paging: {
                page: listRequest.page,
                size: listRequest.size,
                total_items: totalItems,
                total_pages: Math.ceil(totalItems / listRequest.size)
            }
        }
    }

    static async get(user: User, id: number): Promise<ActivityResponse> {
        const activity = await ActivityAccess.get(user, id)
        return toActivityResponse(activity)
    }

    static async update(user: User, id: number, request: UpdateActivityRequest): Promise<ActivityResponse> {
        const updateRequest = ActivityValidation.UPDATE.parse(request)
        const result = await prismaClient.$transaction(async (transaction) => {
            const activity = await ActivityAccess.lock(user, id, transaction)

            if (updateRequest.category_id !== undefined) {
                const category = await transaction.category.findUnique({
                    where: {id: updateRequest.category_id}
                })
                if (!category) {
                    throw new ResponseError(400, "Category not found")
                }
            }
            if (updateRequest.responsible_user_id !== undefined) {
                ActivityAccess.checkResponsible(user, updateRequest.responsible_user_id)
                const responsibleUser = await transaction.user.findUnique({
                    where: {id: updateRequest.responsible_user_id}
                })
                if (!responsibleUser) {
                    throw new ResponseError(400, "Responsible user not found")
                }
            }

            const startDate = updateRequest.start_date ?? activity.start_date.toISOString().slice(0, 10)
            const endDate = updateRequest.end_date ?? activity.end_date.toISOString().slice(0, 10)
            if (endDate < startDate) {
                throw new ResponseError(400, "End date must not be before start date")
            }

            const data: Prisma.ActivityUncheckedUpdateInput = {}
            if (updateRequest.name !== undefined) {
                data.name = updateRequest.name
            }
            if (updateRequest.description !== undefined) {
                data.description = updateRequest.description
            }
            if (updateRequest.start_date !== undefined) {
                data.start_date = new Date(startDate + "T00:00:00.000Z")
            }
            if (updateRequest.end_date !== undefined) {
                data.end_date = new Date(endDate + "T00:00:00.000Z")
            }
            if (updateRequest.category_id !== undefined) {
                data.category_id = updateRequest.category_id
            }
            if (updateRequest.responsible_user_id !== undefined) {
                data.responsible_user_id = updateRequest.responsible_user_id
            }
            if (updateRequest.status !== undefined) {
                data.status = updateRequest.status
            }
            return transaction.activity.update({
                where: {id: activity.id},
                data: data
            })
        })
        return toActivityResponse(result)
    }

    static async updateStatus(user: User, id: number, request: UpdateActivityStatusRequest): Promise<ActivityResponse> {
        const statusRequest = ActivityValidation.UPDATE_STATUS.parse(request)
        return this.update(user, id, statusRequest)
    }

    static async delete(user: User, id: number): Promise<{message: string}> {
        let files: {original: string, temporary: string}[] = []
        try{
            await prismaClient.$transaction(async (transaction) => {
                const activity = await ActivityAccess.lock(user, id, transaction)
                const documents = await transaction.documentation.findMany({
                    where: {activity_id: activity.id}
                })
                files = await FileStorage.stage(documents.map(document => document.file_path))
                await transaction.activity.delete({where: {id: activity.id}})
            }, {timeout: 30000})
        }
        catch (error){
            await FileStorage.restore(files)
            throw error
        }
        await FileStorage.purge(files)
        return {message: "Activity deleted successfully"}
    }
}
