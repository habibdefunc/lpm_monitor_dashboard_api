import {Documentation, User} from "@prisma/client"
import {prismaClient} from "../application/db"
import {FileStorage} from "../application/fileStorage"
import {ResponseError} from "../error/responseError"
import {ActivityAccess} from "./activityAccess"
import {ApiValidation} from "../validation/apiValidation"
import {DocumentationValidation} from "../validation/documentationValidation"
import {DocumentationResponse, toDocumentationResponse} from "../model/documentationModel"
import {SupabaseStorage} from "../application/supabaseStorage"
import {UploadTicket} from "../application/uploadTicket"
import {randomUUID} from "node:crypto"
import {logger} from "../application/logging"

export class DocumentationService {
    static async prepare(user: User, activityId: number, request: unknown) {
        const activity = await ActivityAccess.get(user, activityId)
        const body = DocumentationValidation.PREPARE.parse(request)
        const extension = DocumentationValidation.extension(body.file_name, body.mime_type)
        const id = randomUUID()
        const ticket = UploadTicket.create({
            id, userId: user.id, activityId: activity.id, name: body.file_name,
            mime: body.mime_type, size: body.size, extension, expires: Date.now() + 2 * 60 * 60 * 1000
        })
        const uploadUrl = await SupabaseStorage.signUpload(id + ".upload." + extension)
        return {ticket, upload_url: uploadUrl}
    }

    static async complete(user: User, activityId: number, request: unknown): Promise<DocumentationResponse> {
        await ActivityAccess.get(user, activityId)
        const {ticket} = DocumentationValidation.COMPLETE.parse(request)
        const data = UploadTicket.verify(ticket)
        if (data.userId !== user.id || data.activityId !== activityId) throw new ResponseError(403, "Upload ticket does not belong to this user and activity")
        const temporary = data.id + ".upload." + data.extension
        const finalName = data.id + "." + data.extension
        const filePath = "supabase:" + finalName
        const result = await prismaClient.$transaction(async transaction => {
            // Serializes finalization with deletion/reassignment and duplicate retries.
            await ActivityAccess.lock(user, activityId, transaction)
            const existing = await transaction.documentation.findFirst({where: {activity_id: activityId, file_path: filePath}})
            if (existing) return existing
            const buffer = await SupabaseStorage.read(temporary)
            if (buffer.length !== data.size) throw new ResponseError(400, "Uploaded file size does not match")
            DocumentationValidation.validate({
                originalname: data.name, mimetype: data.mime, size: buffer.length, buffer
            } as Express.Multer.File)
            // Only the server can write the final object. The signed upload URL
            // cannot replace already validated document content.
            await SupabaseStorage.remove(finalName)
            await SupabaseStorage.save(finalName, buffer, data.mime)
            return transaction.documentation.create({data: {
                activity_id: activityId, file_name: data.name, file_path: filePath,
                mime_type: data.mime, size: buffer.length, uploaded_by: user.id
            }})
        }, {timeout: 90000})
        // A cleanup outage must not turn an already committed upload into failure.
        await SupabaseStorage.remove(temporary).catch(() => logger.warn("Temporary upload cleanup pending"))
        return toDocumentationResponse(result)
    }

    static async cancel(user: User, activityId: number, request: unknown) {
        const {ticket} = DocumentationValidation.COMPLETE.parse(request)
        const data = UploadTicket.verify(ticket)
        if (data.userId !== user.id || data.activityId !== activityId) throw new ResponseError(403, "Upload ticket does not belong to this user and activity")
        // Only the ticket owner's temporary object; committed objects stay intact.
        await SupabaseStorage.remove(data.id + ".upload." + data.extension)
        return {message: "Temporary upload removed"}
    }

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
