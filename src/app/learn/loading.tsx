import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/shared/loading-skeletons";

export default function LearnLoading() {
  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <Skeleton className="mx-auto h-4 w-28" />
        <Skeleton className="mx-auto mt-4 h-11 w-40" />
        <Skeleton className="mx-auto mt-5 h-16 w-full max-w-lg" />
      </div>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-full sm:w-64" />
      </div>

      <div className="mt-10">
        <CardGridSkeleton count={6} />
      </div>
    </div>
  );
}
