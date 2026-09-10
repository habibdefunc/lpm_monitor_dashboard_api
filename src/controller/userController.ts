import {Request, Response, NextFunction} from "express"
import { CreateUserRequest, LoginUserRequest, UpdateUserRequest, UpdateCurrentUserRequest} from "../model/userModel"
import { UserRequest } from "../type/userRequest"
import {UserService} from "../service/userService"

export class UserController {
    static async delete(req: UserRequest, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const response = await UserService.delete(id, req.user!)
            res.status(200).json({
                data: response
            })
        }
        catch (e){
            next(e)
        }
    }

    static async register(req: Request, res: Response, next: NextFunction){
        try{

            const request: CreateUserRequest = req.body as CreateUserRequest
            const response =  await UserService.register(request)
            res.status(201).json({
                data:response
            })
        }
        catch (e){
            next(e)
        }
    }

    static async login(req: Request, res: Response, next: NextFunction){
        try{

            const request: LoginUserRequest = req.body as LoginUserRequest
            const response =  await UserService.login(request)
            res.status(200).json({
                data:response
            })
        }
        catch (e){
            next(e)
        }
    }

    static async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const response = await UserService.getAll()
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const response = await UserService.getById(id)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async updateById(req: Request, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const request: UpdateUserRequest = req.body as UpdateUserRequest
            const response = await UserService.updateById(id, request)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async get(req: UserRequest, res: Response, next: NextFunction){
        try{

            const response =  await UserService.get(req.user!)
            res.status(200).json({
                data:response
            })
        }
        catch (e){
            next(e)
        }
    }

     static async update(req: UserRequest, res: Response, next: NextFunction){
        try{
            const request: UpdateCurrentUserRequest = req.body as UpdateCurrentUserRequest
            const response =  await UserService.updateCurrent(req.user!, request)
            res.status(200).json({
                data:response
            })
        }
        catch (e){
            next(e)
        }
    }

    static async logout(req: UserRequest, res: Response, next: NextFunction){
        try{

            const response =  await UserService.logout(req.user!)
            res.status(200).json({
                data:"OK"
            })
        }
        catch (e){
            next(e)
        }
    }
}
