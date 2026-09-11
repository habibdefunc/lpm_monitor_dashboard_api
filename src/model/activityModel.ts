import {Activity} from "@prisma/client"

export type CreateActivityRequest = {
    name: string
    description?: string | null | undefined
    start_date: string
    end_date: string
    category_id: number | string
    responsible_user_id: number | string
    status?: string | undefined
}

export type UpdateActivityRequest = Partial<CreateActivityRequest>

export type UpdateActivityStatusRequest = {
    status: string
}

export type ActivityResponse = {
    id: number
    name: string
    description: string | null
    start_date: string
    end_date: string
    category_id: number
    responsible_user_id: number | null
    status: string
}

export type ActivityListResponse = {
    data: ActivityResponse[]
    paging: {
        page: number
        size: number
        total_items: number
        total_pages: number
    }
}

export function toActivityResponse(activity: Activity): ActivityResponse {
    return {
        id: activity.id,
        name: activity.name,
        description: activity.description,
        start_date: activity.start_date.toISOString().slice(0, 10),
        end_date: activity.end_date.toISOString().slice(0, 10),
        category_id: activity.category_id,
        responsible_user_id: activity.responsible_user_id,
        status: activity.status
    }
}
