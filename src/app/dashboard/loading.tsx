import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container-page px-6 py-12 lg:px-12 max-w-[1400px] space-y-10">
      {/* Welcome Banner Skeleton */}
      <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3 max-w-lg w-full">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>

          {/* Continue Learning */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>

          {/* Recently Viewed */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-52" />
            <div className="space-y-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-8">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
