import { describe, expect, it } from "vitest";

import {
  buildDaySlots,
  buildSlotStart,
  CLOSING_HOUR,
  formatCLP,
  formatLongDate,
  formatShortDate,
  formatTime,
  getSlotKey,
  getUpcomingDays,
  isCancellable,
  isValidDateKey,
  isValidSlotStart,
  localDateKey,
  OPENING_HOUR,
  PENDING_HOLD_MINUTES,
  SLOT_MINUTES,
} from "./booking";

describe("club configuration", () => {
  it("uses one-hour slots between 09:00 and 22:00", () => {
    expect(OPENING_HOUR).toBe(9);
    expect(CLOSING_HOUR).toBe(22);
    expect(SLOT_MINUTES).toBe(60);
    expect(PENDING_HOLD_MINUTES).toBe(10);
  });

  it("builds the thirteen daily slots", () => {
    const slots = buildDaySlots("2026-10-23");

    expect(slots).toHaveLength(13);
    expect(slots[0]?.label).toBe("09:00");
    expect(slots.at(-1)?.label).toBe("21:00");
    expect(slots.map((slot) => slot.hour)).toEqual([
      9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    ]);
  });
});

describe("Santiago timezone helpers", () => {
  it("derives the local date from a UTC instant", () => {
    expect(localDateKey(new Date("2026-10-23T02:30:00.000Z"))).toBe(
      "2026-10-22",
    );
    expect(localDateKey(new Date("2026-10-23T03:00:00.000Z"))).toBe(
      "2026-10-23",
    );
  });

  it("builds a local 09:00 slot with the correct UTC offset", () => {
    const startsAt = buildSlotStart("2026-10-23", 9);

    expect(startsAt.getTime()).toBe(
      Date.parse("2026-10-23T12:00:00.000Z"),
    );
    expect(startsAt.toISOString()).toBe("2026-10-23T09:00:00.000-03:00");
    expect(formatTime(startsAt)).toBe("09:00");
  });

  it("formats dates in Spanish with a single leading capital", () => {
    const date = new Date("2026-10-23T12:00:00.000Z");

    expect(formatLongDate(date)).toBe("Viernes 23 de octubre");
    expect(formatShortDate(date)).toBe("23 oct 2026");
    expect(formatTime(date)).toBe("09:00");
  });

  it("formats CLP amounts without decimals", () => {
    const formatted = formatCLP(25000);

    expect(formatted).toContain("25.000");
    expect(formatted).not.toContain(",00");
  });

  it("returns fourteen upcoming days starting with today", () => {
    const days = getUpcomingDays();

    expect(days).toHaveLength(14);
    expect(days[0]?.weekday).toBe("Hoy");
    expect(days[0]?.isToday).toBe(true);
    expect(new Set(days.map((day) => day.key)).size).toBe(14);
  });
});

describe("date and slot validation", () => {
  it("validates calendar date keys", () => {
    expect(isValidDateKey("2026-10-23")).toBe(true);
    expect(isValidDateKey("2024-02-29")).toBe(true);
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("23-10-2026")).toBe(false);
    expect(isValidDateKey("2026-13-01")).toBe(false);
  });

  it("accepts only whole-hour slots inside opening hours", () => {
    expect(isValidSlotStart(buildSlotStart("2026-10-23", 9))).toBe(true);
    expect(isValidSlotStart(buildSlotStart("2026-10-23", 21))).toBe(true);
    expect(isValidSlotStart(new Date("2026-10-23T11:59:00.000Z"))).toBe(
      false,
    );
    expect(isValidSlotStart(new Date("2026-10-23T12:30:00.000Z"))).toBe(
      false,
    );
    expect(isValidSlotStart(new Date("2026-10-23T12:00:30.000Z"))).toBe(
      false,
    );
    expect(isValidSlotStart(new Date("2026-10-24T01:00:00.000Z"))).toBe(
      false,
    );
  });

  it("builds a stable active-slot key", () => {
    const startsAt = buildSlotStart("2026-10-23", 9);

    expect(getSlotKey("court-1", startsAt)).toBe(
      "court-1:2026-10-23T09:00:00.000-03:00",
    );
  });
});

describe("cancellation policy", () => {
  const startsAt = new Date("2026-10-23T12:00:00.000Z");

  it("allows cancellation exactly two hours before the match", () => {
    expect(
      isCancellable(startsAt, "PAID", new Date("2026-10-23T10:00:00.000Z")),
    ).toBe(true);
    expect(
      isCancellable(
        startsAt,
        "PENDING",
        new Date("2026-10-23T10:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("blocks cancellation inside the two-hour window", () => {
    expect(
      isCancellable(
        startsAt,
        "PAID",
        new Date("2026-10-23T10:00:00.001Z"),
      ),
    ).toBe(false);
  });

  it("only applies to pending and paid reservations", () => {
    expect(
      isCancellable(startsAt, "CANCELLED", new Date("2026-10-23T08:00:00.000Z")),
    ).toBe(false);
    expect(
      isCancellable(startsAt, "BLOCKED", new Date("2026-10-23T08:00:00.000Z")),
    ).toBe(false);
  });
});
