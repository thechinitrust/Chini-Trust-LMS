import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCourseBuilderLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-32" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="mt-8">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
