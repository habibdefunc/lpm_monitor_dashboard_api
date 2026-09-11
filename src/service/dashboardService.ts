import {User} from "@prisma/client"
import {prismaClient} from "../application/db"
import {getJakartaToday, toUtcDate, monthRange} from "../application/date"
import {ActivityAccess} from "./activityAccess"
import {DashboardValidation} from "../validation/dashboardValidation"
import {DashboardResponse} from "../model/dashboardModel"
import {toActivityResponse} from "../model/activityModel"

export class DashboardService {
    static async get(user: User, request: unknown): Promise<DashboardResponse> {
        const query = DashboardValidation.GET.parse(request)
        const today = getJakartaToday()
        const year = query.year ?? Number(today.slice(0, 4))
        const where = ActivityAccess.filter(user)

        return prismaClient.$transaction(async (transaction) => {
            const statuses = await transaction.activity.groupBy({
                by: ["status"],
                where: where,
                _count: {_all: true}
            })
            const upcoming = await transaction.activity.findMany({
                where: {
                    ...where,
                    status: "DIRENCANAKAN",
                    start_date: {gte: toUtcDate(today)}
                },
                orderBy: [{start_date: "asc"}, {id: "asc"}],
                take: 5
            })
            const latest = await transaction.activity.findMany({
                where: where,
                orderBy: {id: "desc"},
                take: 5
            })
            const monthly: {month: number, total: number}[] = []
            for (let month = 1; month <= 12; month++) {
                let total = 0
                if (year >= 1000) {
                    const range = monthRange(year, month)
                    total = await transaction.activity.count({
                        where: {...where, start_date: {gte: range.start, lte: range.end}}
                    })
                }
                monthly.push({month: month, total: total})
            }
            return {
                year: year,
                summary: {
                    total: statuses.reduce((total, item) => total + item._count._all, 0),
                    direncanakan: statuses.find(item => item.status === "DIRENCANAKAN")?._count._all ?? 0,
                    berjalan: statuses.find(item => item.status === "BERJALAN")?._count._all ?? 0,
                    selesai: statuses.find(item => item.status === "SELESAI")?._count._all ?? 0
                },
                monthly_activities: monthly,
                upcoming_activities: upcoming.map(toActivityResponse),
                latest_activities: latest.map(toActivityResponse)
            }
        })
    }
}
