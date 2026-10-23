import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";

export const CLUB_TIMEZONE = "America/Santiago";
export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 22;
export const SLOT_MINUTES = 60;
export const PENDING_HOLD_MINUTES = 10;
export const CANCELLATION_HOURS = 2;

export const reservationStatusLabels = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
  BLOCKED: "Bloqueada",
} as const;

export type ReservationStatusValue = keyof typeof reservationStatusLabels;

export const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(value: number) {
  return currencyFormatter.format(value);
}

export function localDateKey(date: Date = new Date()) {
  return format(new TZDate(date, CLUB_TIMEZONE), "yyyy-MM-dd");
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

export function isValidDateKey(dateKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false;
  }

  const { year, month, day } = parseDateKey(dateKey);
  const date = new TZDate(year, month - 1, day, CLUB_TIMEZONE);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function startOfLocalDay(dateKey: string) {
  const { year, month, day } = parseDateKey(dateKey);
  return new TZDate(year, month - 1, day, 0, 0, 0, 0, CLUB_TIMEZONE);
}

export function endOfLocalDay(dateKey: string) {
  const nextDay = addDays(startOfLocalDay(dateKey), 1);
  return new TZDate(nextDay.getTime() - 1, CLUB_TIMEZONE);
}

export function buildSlotStart(dateKey: string, hour: number) {
  const { year, month, day } = parseDateKey(dateKey);
  return new TZDate(year, month - 1, day, hour, 0, 0, 0, CLUB_TIMEZONE);
}

export function buildDaySlots(dateKey: string) {
  const slots: Array<{ hour: number; label: string; startsAt: Date }> = [];

  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour += 1) {
    const startsAt = buildSlotStart(dateKey, hour);
    slots.push({
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      startsAt,
    });
  }

  return slots;
}

export function formatTime(date: Date) {
  return format(new TZDate(date, CLUB_TIMEZONE), "HH:mm");
}

export function formatLongDate(date: Date) {
  const value = format(
    new TZDate(date, CLUB_TIMEZONE),
    "EEEE d 'de' MMMM",
    { locale: es },
  );

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatShortDate(date: Date) {
  return format(new TZDate(date, CLUB_TIMEZONE), "dd MMM yyyy", {
    locale: es,
  });
}

export function formatDateTime(date: Date) {
  return format(new TZDate(date, CLUB_TIMEZONE), "dd MMM yyyy · HH:mm", {
    locale: es,
  });
}

export function formatWeekday(date: Date) {
  return format(new TZDate(date, CLUB_TIMEZONE), "EEE", { locale: es });
}

export function formatDayNumber(date: Date) {
  return format(new TZDate(date, CLUB_TIMEZONE), "d");
}

export function formatMonth(date: Date) {
  return format(new TZDate(date, CLUB_TIMEZONE), "MMM", { locale: es });
}

export function getUpcomingDays(count = 14) {
  const today = new TZDate(new Date(), CLUB_TIMEZONE);

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(today, index);
    const key = format(date, "yyyy-MM-dd");

    return {
      key,
      weekday: index === 0 ? "Hoy" : formatWeekday(date),
      day: formatDayNumber(date),
      month: formatMonth(date),
      isToday: index === 0,
    };
  });
}

export function isCancellable(
  startsAt: Date,
  status: ReservationStatusValue,
  now: Date = new Date(),
) {
  if (status !== "PAID" && status !== "PENDING") {
    return false;
  }

  return startsAt.getTime() - now.getTime() >= CANCELLATION_HOURS * 60 * 60 * 1000;
}

export function getSlotKey(courtId: string, startsAt: Date) {
  return `${courtId}:${startsAt.toISOString()}`;
}

export function isValidSlotStart(startsAt: Date) {
  const local = new TZDate(startsAt, CLUB_TIMEZONE);
  const hour = local.getHours();

  return (
    local.getMinutes() === 0 &&
    local.getSeconds() === 0 &&
    hour >= OPENING_HOUR &&
    hour < CLOSING_HOUR
  );
}

export function statusLabel(status: ReservationStatusValue) {
  return reservationStatusLabels[status];
}
