import { Skeleton } from "@/components/ui/skeleton";

export function TripCardSkeleton() {
  return (
    <div className="surface rounded-2xl overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none bg-[var(--color-surface-2)]" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4 bg-[var(--color-surface-2)]" />
        <Skeleton className="h-3 w-1/2 bg-[var(--color-surface-2)]" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 bg-[var(--color-surface-2)] rounded-full" />
          <Skeleton className="h-5 w-20 bg-[var(--color-surface-2)] rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="surface rounded-2xl p-5 space-y-3">
      <Skeleton className="h-3 w-1/2 bg-[var(--color-surface-2)]" />
      <Skeleton className="h-8 w-2/3 bg-[var(--color-surface-2)]" />
    </div>
  );
}
