import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="container-page px-6 py-12 lg:px-12 lg:py-16">
      <Skeleton className="h-4 w-40" />

      <div className="mt-5 flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <Skeleton className="mt-4 h-11 w-full max-w-2xl" />
      <Skeleton className="mt-4 h-14 w-full max-w-xl" />

      <div className="mt-6 flex flex-wrap gap-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1.7fr_minmax(0,1fr)]">
        <div className="min-w-0">
          <Skeleton className="aspect-video w-full rounded-2xl" />

          <div className="mt-10 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="mt-12 space-y-4">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>

        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
