import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/shared/loading-skeletons";

export default function ResourcesLoading() {
  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <Skeleton className="mx-auto h-4 w-36" />
        <Skeleton className="mx-auto mt-4 h-11 w-56" />
        <Skeleton className="mx-auto mt-5 h-12 w-full max-w-md" />
      </div>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-10 w-full rounded-full" />
        <div className="flex justify-center gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>

      <div className="mt-10">
        <CardGridSkeleton count={6} />
      </div>
    </div>
  );
}
