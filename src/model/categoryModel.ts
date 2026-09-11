import {Category} from "@prisma/client"

export type CreateCategoryRequest = {
    name: string
    description: string
}

export type UpdateCategoryRequest = {
    name?: string | undefined
    description?: string | undefined
}

export type CategoryResponse = {
    id: number
    name: string
    description: string
}

export function toCategoryResponse(category: Category): CategoryResponse {
    return {
        id: category.id,
        name: category.name,
        description: category.description
    }
}
