"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { updateReservationStatusAction } from "@/server/actions/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  reservationStatusLabels,
  type ReservationStatusValue,
} from "@/lib/booking";

const statuses: ReservationStatusValue[] = [
  "PENDING",
  "PAID",
  "CANCELLED",
  "BLOCKED",
];

export function ReservationStatusControl({
  reservationId,
  status,
}: {
  reservationId: string;
  status: ReservationStatusValue;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPending, setIsPending] = useState(false);

  async function handleChange(nextStatus: string) {
    if (nextStatus === currentStatus) {
      return;
    }

    setIsPending(true);

    try {
      const result = await updateReservationStatusAction({
        reservationId,
        status: nextStatus as ReservationStatusValue,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setCurrentStatus(nextStatus as ReservationStatusValue);
      toast.success("Estado actualizado.");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
      ) : null}
      <Select
        value={currentStatus}
        onValueChange={handleChange}
        disabled={isPending}
      >
        <SelectTrigger size="sm" className="w-32 rounded-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((value) => (
            <SelectItem key={value} value={value}>
              {reservationStatusLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
