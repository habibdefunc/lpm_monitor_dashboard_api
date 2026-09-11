import {Prisma, User} from "@prisma/client"
import {prismaClient} from "../application/db"
import {getJakartaToday, monthRange} from "../application/date"
import {ActivityAccess} from "./activityAccess"
import {CalendarValidation} from "../validation/calendarValidation"
import {CalendarResponse} from "../model/calendarModel"

export class CalendarService {
    static async get(user: User, request: unknown): Promise<CalendarResponse> {
        const query = CalendarValidation.GET.parse(request)
        const today = getJakartaToday()
        const year = query.year ?? Number(today.slice(0, 4))
        const month = query.month ?? Number(today.slice(5, 7))
        const where: Prisma.ActivityWhereInput = ActivityAccess.filter(user)
        if (query.responsible_user_id !== undefined) {
            ActivityAccess.checkResponsible(user, query.responsible_user_id)
            where.responsible_user_id = query.responsible_user_id
        }
        if (query.category_id !== undefined) {
            where.category_id = query.category_id
        }
        if (query.status !== undefined) {
            where.status = query.status
        }
        if (year < 1000) {
            return {year: year, month: month, events: []}
        }
        const range = monthRange(year, month)
        where.start_date = {lte: range.end}
        where.end_date = {gte: range.start}
        const activities = await prismaClient.activity.findMany({
            where: where,
            orderBy: [{start_date: "asc"}, {id: "asc"}]
        })
        return {
            month: month,
            year: year,
            events: activities.map(activity => {
                let label = "Direncanakan"
                let color = "#3B82F6"
                if (activity.status === "BERJALAN") {
                    label = "Berjalan"
                    color = "#F59E0B"
                }
                if (activity.status === "SELESAI") {
                    label = "Selesai"
                    color = "#22C55E"
                }
                return {
                    activity_id: activity.id,
                    name: activity.name,
                    start_date: activity.start_date.toISOString().slice(0, 10),
                    end_date: activity.end_date.toISOString().slice(0, 10),
                    category_id: activity.category_id,
                    responsible_user_id: activity.responsible_user_id,
                    status: activity.status,
                    status_label: label,
                    color: color
                }
            })
        }
    }
}
