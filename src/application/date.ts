export function getJakartaToday(): string {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date())

    return [
        parts.find(part => part.type === "year")!.value,
        parts.find(part => part.type === "month")!.value,
        parts.find(part => part.type === "day")!.value
    ].join("-")
}

export function toUtcDate(value: string): Date {
    return new Date(value + "T00:00:00.000Z")
}

export function monthRange(year: number, month: number): {start: Date, end: Date} {
    const monthText = String(month).padStart(2, "0")
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
    return {
        start: toUtcDate(year + "-" + monthText + "-01"),
        end: toUtcDate(year + "-" + monthText + "-" + days)
    }
}
