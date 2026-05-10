import { getTripStatus } from "@/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  upcoming: { label: "Upcoming", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  ongoing: { label: "Ongoing", className: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
  completed: { label: "Completed", className: "bg-[#334155] text-[#94A3B8] border-[#475569]" },
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
