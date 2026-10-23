import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReservationStatusBadge } from "./status-badge";

describe("ReservationStatusBadge", () => {
  it("renders the Spanish label for a paid reservation", () => {
    render(<ReservationStatusBadge status="PAID" />);

    expect(screen.getByText("Pagada")).toBeInTheDocument();
  });

  it("renders pending, cancelled and blocked states", () => {
    const { rerender } = render(<ReservationStatusBadge status="PENDING" />);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();

    rerender(<ReservationStatusBadge status="CANCELLED" />);
    expect(screen.getByText("Cancelada")).toBeInTheDocument();

    rerender(<ReservationStatusBadge status="BLOCKED" />);
    expect(screen.getByText("Bloqueada")).toBeInTheDocument();
  });
});
