import { getTripStatus } from "@/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  upcoming: { label: "Upcoming", className: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400" },
  ongoing:  { label: "Ongoing",  className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400" },
  completed:{ label: "Completed",className: "bg-[var(--color-surface-2)] text-[var(--color-muted)] border-[var(--color-border)]" },
};

export function TripStatusBadge({
  startDate,
  endDate,
}: {
  startDate: Date | string;
  endDate: Date | string;
}) {
  const status = getTripStatus(startDate, endDate);
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
