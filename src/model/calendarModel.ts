export type CalendarResponse = {
    month: number
    year: number
    events: {
        activity_id: number
        name: string
        start_date: string
        end_date: string
        category_id: number
        responsible_user_id: number | null
        status: string
        status_label: string
        color: string
    }[]
}
