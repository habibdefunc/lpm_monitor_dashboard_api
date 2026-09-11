import {ActivityResponse} from "./activityModel"

export type DashboardResponse = {
    year: number
    summary: {
        total: number
        direncanakan: number
        berjalan: number
        selesai: number
    }
    monthly_activities: {month: number, total: number}[]
    upcoming_activities: ActivityResponse[]
    latest_activities: ActivityResponse[]
}
