import {Request, Response, NextFunction} from "express"
import {UserRequest} from "../type/userRequest"
import {CategoryService} from "../service/categoryService"
import {CreateCategoryRequest, UpdateCategoryRequest} from "../model/categoryModel"

export class CategoryController {
    static async create(req: UserRequest, res: Response, next: NextFunction){
        try{
            const request: CreateCategoryRequest = req.body as CreateCategoryRequest
            const response = await CategoryService.create(request)
            res.status(201).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async getAll(req: UserRequest, res: Response, next: NextFunction){
        try{
            const response = await CategoryService.getAll(req.query)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async get(req: UserRequest, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const response = await CategoryService.get(id)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async update(req: UserRequest, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const request: UpdateCategoryRequest = req.body as UpdateCategoryRequest
            const response = await CategoryService.update(id, request)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }

    static async delete(req: UserRequest, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const response = await CategoryService.delete(id)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }
}
