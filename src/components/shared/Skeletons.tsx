import { Skeleton } from "@/components/ui/skeleton";

export function TripCardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-3/4 bg-[#334155]" />
      <Skeleton className="h-3 w-1/2 bg-[#334155]" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 bg-[#334155] rounded-full" />
        <Skeleton className="h-6 w-20 bg-[#334155] rounded-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 space-y-2">
      <Skeleton className="h-3 w-1/2 bg-[#334155]" />
      <Skeleton className="h-8 w-2/3 bg-[#334155]" />
    </div>
  );
}
