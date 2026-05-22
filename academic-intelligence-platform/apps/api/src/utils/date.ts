import dayjs from "dayjs";

export function toIsoDate(value: Date): string {
  return dayjs(value).format("YYYY-MM-DD");
}

export function daysUntil(value: Date): number {
  return dayjs(value).startOf("day").diff(dayjs().startOf("day"), "day");
}

export function isInLastDays(value: Date, days: number): boolean {
  const now = dayjs();
  const threshold = now.subtract(days, "day");
  return dayjs(value).isAfter(threshold);
}
