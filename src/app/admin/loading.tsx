import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function ChartCardSkeleton() {
  return (
    <Card className="h-full border border-border shadow-soft">
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-9 w-64" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCardSkeleton />
          </div>
          <ChartCardSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
      </div>
    </div>
  );
}
