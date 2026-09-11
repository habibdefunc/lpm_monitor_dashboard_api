import {Request, Response, NextFunction} from "express"
import {UserRequest} from "../type/userRequest"
import {ActivityService} from "../service/activityService"
import {CreateActivityRequest, UpdateActivityRequest, UpdateActivityStatusRequest} from "../model/activityModel"

export class ActivityController {
    static async create(req: UserRequest, res: Response, next: NextFunction){
        try{
            const request: CreateActivityRequest = req.body as CreateActivityRequest
            const response = await ActivityService.create(req.user!, request)
            res.status(201).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async getAll(req: UserRequest, res: Response, next: NextFunction){
        try{
            const response = await ActivityService.getAll(req.user!, req.query)
            res.status(200).json(response)
        }
        catch (e){
            next(e)
        }
    }

    static async get(req: UserRequest, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const response = await ActivityService.get(req.user!, id)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async update(req: UserRequest, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const request: UpdateActivityRequest = req.body as UpdateActivityRequest
            const response = await ActivityService.update(req.user!, id, request)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async updateStatus(req: UserRequest, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const request: UpdateActivityStatusRequest = req.body as UpdateActivityStatusRequest
            const response = await ActivityService.updateStatus(req.user!, id, request)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async delete(req: UserRequest, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const response = await ActivityService.delete(req.user!, id)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }
}
