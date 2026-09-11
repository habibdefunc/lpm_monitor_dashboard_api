import {Documentation, User} from "@prisma/client"
import {prismaClient} from "../application/db"
import {FileStorage} from "../application/fileStorage"
import {ResponseError} from "../error/responseError"
import {ActivityAccess} from "./activityAccess"
import {ApiValidation} from "../validation/apiValidation"
import {DocumentationValidation} from "../validation/documentationValidation"
import {DocumentationResponse, toDocumentationResponse} from "../model/documentationModel"

export class DocumentationService {
    static async upload(user: User, activityId: number, file: Express.Multer.File | undefined): Promise<DocumentationResponse> {
        await ActivityAccess.get(user, activityId)
        const extension = DocumentationValidation.validate(file)
        if (!file) {
            throw new ResponseError(400, "File is required")
        }
        const filePath = await FileStorage.save(file.buffer, extension)
        try{
            const document = await prismaClient.$transaction(async (transaction) => {
                const activity = await ActivityAccess.lock(user, activityId, transaction)
                return transaction.documentation.create({
                    data: {
                        activity_id: activity.id,
                        file_name: file.originalname,
                        file_path: filePath,
                        mime_type: file.mimetype,
                        size: file.size,
                        uploaded_by: user.id
                    }
                })
            })
            return toDocumentationResponse(document)
        }
        catch (error){
            await FileStorage.delete(filePath)
            throw error
        }
    }

    static async getAll(user: User, activityId: number, query: unknown): Promise<DocumentationResponse[]> {
        ApiValidation.EMPTY_QUERY.parse(query)
        const activity = await ActivityAccess.get(user, activityId)
        const documents = await prismaClient.documentation.findMany({
            where: {activity_id: activity.id},
            orderBy: [{created_at: "desc"}, {id: "asc"}]
        })
        return documents.map(toDocumentationResponse)
    }

    static async find(user: User, activityId: number, id: number): Promise<Documentation> {
        const activity = await ActivityAccess.get(user, activityId)
        const documentId = ApiValidation.ID.parse(id)
        const document = await prismaClient.documentation.findFirst({
            where: {id: documentId, activity_id: activity.id}
        })
        if (!document) {
            throw new ResponseError(404, "Documentation not found")
        }
        return document
    }

    static async get(user: User, activityId: number, id: number): Promise<DocumentationResponse> {
        const document = await this.find(user, activityId, id)
        return toDocumentationResponse(document)
    }

    static async delete(user: User, activityId: number, id: number): Promise<{message: string}> {
        const documentId = ApiValidation.ID.parse(id)
        let files: {original: string, temporary: string}[] = []
        try{
            await prismaClient.$transaction(async (transaction) => {
                const activity = await ActivityAccess.lock(user, activityId, transaction)
                const document = await transaction.documentation.findFirst({
                    where: {id: documentId, activity_id: activity.id}
                })
                if (!document) {
                    throw new ResponseError(404, "Documentation not found")
                }
                files = await FileStorage.stage([document.file_path])
                await transaction.documentation.delete({where: {id: document.id}})
            }, {timeout: 30000})
        }
        catch (error){
            await FileStorage.restore(files)
            throw error
        }
        await FileStorage.purge(files)
        return {message: "Documentation deleted successfully"}
    }
}
