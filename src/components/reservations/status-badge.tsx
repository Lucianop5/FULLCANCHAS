import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  statusLabel,
  type ReservationStatusValue,
} from "@/lib/booking";

const styles: Record<ReservationStatusValue, string> = {
  PAID: "border-success/30 bg-success/10 text-success",
  PENDING:
    "border-warning/30 bg-warning/10 text-warning-foreground dark:text-warning",
  CANCELLED: "border-border bg-muted text-muted-foreground",
  BLOCKED: "border-border bg-secondary text-secondary-foreground",
};

export function ReservationStatusBadge({
  status,
  className,
}: {
  status: ReservationStatusValue;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full", styles[status], className)}
    >
      {statusLabel(status)}
    </Badge>
  );
}
