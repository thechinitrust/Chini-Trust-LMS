import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="container-page px-6 py-10 lg:px-12 lg:py-14">
      <div className="flex flex-wrap items-center gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1.65fr_minmax(0,1fr)]">
        <div className="min-w-0">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>

          <Skeleton className="mt-8 h-32 w-full rounded-2xl" />

          <div className="mt-9 flex items-center justify-between gap-3">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        <div className="space-y-5">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
