import {prismaClient} from "../application/db"
import {ResponseError} from "../error/responseError"
import {ApiValidation} from "../validation/apiValidation"
import {CategoryValidation} from "../validation/categoryValidation"
import {CreateCategoryRequest, UpdateCategoryRequest, CategoryResponse, toCategoryResponse} from "../model/categoryModel"

export class CategoryService {
    static async create(request: CreateCategoryRequest): Promise<CategoryResponse> {
        const createRequest = CategoryValidation.CREATE.parse(request)
        const totalCategories = await prismaClient.category.count({
            where: {name: createRequest.name}
        })
        if (totalCategories > 0) {
            throw new ResponseError(409, "Category name already exists")
        }
        const category = await prismaClient.category.create({
            data: createRequest
        })
        return toCategoryResponse(category)
    }

    static async getAll(request: unknown): Promise<CategoryResponse[]> {
        ApiValidation.EMPTY_QUERY.parse(request)
        const categories = await prismaClient.category.findMany({
            orderBy: [{name: "asc"}, {id: "asc"}]
        })
        return categories.map(toCategoryResponse)
    }

    static async get(id: number): Promise<CategoryResponse> {
        const categoryId = ApiValidation.ID.parse(id)
        const category = await prismaClient.category.findUnique({
            where: {id: categoryId}
        })
        if (!category) {
            throw new ResponseError(404, "Category not found")
        }
        return toCategoryResponse(category)
    }

    static async update(id: number, request: UpdateCategoryRequest): Promise<CategoryResponse> {
        const categoryId = ApiValidation.ID.parse(id)
        const updateRequest = CategoryValidation.UPDATE.parse(request)
        await this.get(categoryId)

        if (updateRequest.name !== undefined) {
            const totalCategories = await prismaClient.category.count({
                where: {name: updateRequest.name, NOT: {id: categoryId}}
            })
            if (totalCategories > 0) {
                throw new ResponseError(409, "Category name already exists")
            }
        }
        const category = await prismaClient.category.update({
            where: {id: categoryId},
            data: {
                ...(updateRequest.name !== undefined ? {name: updateRequest.name} : {}),
                ...(updateRequest.description !== undefined ? {description: updateRequest.description} : {})
            }
        })
        return toCategoryResponse(category)
    }

    static async delete(id: number): Promise<{message: string}> {
        const categoryId = ApiValidation.ID.parse(id)
        await this.get(categoryId)
        const totalActivities = await prismaClient.activity.count({
            where: {category_id: categoryId}
        })
        if (totalActivities > 0) {
            throw new ResponseError(409, "Category is still used by activities")
        }
        await prismaClient.category.delete({
            where: {id: categoryId}
        })
        return {message: "Category deleted successfully"}
    }
}
