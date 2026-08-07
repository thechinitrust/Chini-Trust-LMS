import { Skeleton } from "@/components/ui/skeleton";

export default function QuizLoading() {
  return (
    <div className="container-page max-w-3xl px-6 py-16 lg:px-12">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-10 w-full max-w-md" />
      <Skeleton className="mt-3 h-5 w-full max-w-lg" />

      <div className="mt-10 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-border p-6">
            <Skeleton className="h-5 w-full max-w-sm" />
            <div className="space-y-2.5">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
