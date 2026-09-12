import {Request, Response, NextFunction} from "express"
import {UserRequest} from "../type/userRequest"
import {DocumentationService} from "../service/documentationService"
import {FileStorage} from "../application/fileStorage"
import {SupabaseStorage} from "../application/supabaseStorage"

export class DocumentationController {
    static async prepare(req: UserRequest, res: Response, next: NextFunction) {
        try {
            res.setHeader("Cache-Control", "private, no-store")
            res.status(200).json({data: await DocumentationService.prepare(req.user!, Number(req.params.activity_id), req.body)})
        } catch (e) { next(e) }
    }
    static async complete(req: UserRequest, res: Response, next: NextFunction) {
        try {
            res.status(201).json({data: await DocumentationService.complete(req.user!, Number(req.params.activity_id), req.body)})
        } catch (e) { next(e) }
    }
    static async cancel(req: UserRequest, res: Response, next: NextFunction) {
        try {
            res.status(200).json({data: await DocumentationService.cancel(req.user!, Number(req.params.activity_id), req.body)})
        } catch (e) { next(e) }
    }
    static async downloadLink(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const document = await DocumentationService.find(req.user!, Number(req.params.activity_id), Number(req.params.id))
            const url = FileStorage.isRemote(document.file_path)
                ? await SupabaseStorage.signDownload(document.file_path.slice(9), document.file_name)
                : null
            res.setHeader("Cache-Control", "private, no-store")
            res.status(200).json({data: {url, expires_in: url ? 60 : null}})
        } catch (e) { next(e) }
    }
    static async upload(req: UserRequest, res: Response, next: NextFunction){
        try{
            const activityId = Number(req.params.activity_id)
            const response = await DocumentationService.upload(req.user!, activityId, req.file)
            res.status(201).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async getAll(req: UserRequest, res: Response, next: NextFunction){
        try{
            const activityId = Number(req.params.activity_id)
            const response = await DocumentationService.getAll(req.user!, activityId, req.query)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async get(req: UserRequest, res: Response, next: NextFunction){
        try{
            const activityId = Number(req.params.activity_id)
            const id = Number(req.params.id)
            const response = await DocumentationService.get(req.user!, activityId, id)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async download(req: UserRequest, res: Response, next: NextFunction){
        try{
            const activityId = Number(req.params.activity_id)
            const id = Number(req.params.id)
            const document = await DocumentationService.find(req.user!, activityId, id)
            if (FileStorage.isRemote(document.file_path)) {
                res.setHeader("Cache-Control", "private, no-store")
                res.redirect(302, await SupabaseStorage.signDownload(document.file_path.slice(9), document.file_name))
                return
            }
            const buffer = await FileStorage.read(document.file_path)
            res.attachment(document.file_name)
            res.setHeader("Content-Type", document.mime_type)
            res.setHeader("Cache-Control", "private, no-store")
            res.setHeader("X-Content-Type-Options", "nosniff")
            res.status(200).send(buffer)
        }
        catch (e){
            next(e)
        }
    }

    static async delete(req: UserRequest, res: Response, next: NextFunction){
        try{
            const activityId = Number(req.params.activity_id)
            const id = Number(req.params.id)
            const response = await DocumentationService.delete(req.user!, activityId, id)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }
}
