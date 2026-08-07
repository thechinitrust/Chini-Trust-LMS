import { Skeleton } from "@/components/ui/skeleton";

export default function CertificateLoading() {
  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        <div className="w-full rounded-3xl border border-primary/20 bg-card p-10 text-center sm:p-16">
          <Skeleton className="mx-auto size-16 rounded-full" />
          <Skeleton className="mx-auto mt-7 h-3 w-48" />
          <Skeleton className="mx-auto mt-6 h-11 w-72" />
          <Skeleton className="mx-auto mt-5 h-4 w-56" />
          <Skeleton className="mx-auto mt-2 h-7 w-64" />
          <Skeleton className="mx-auto mt-7 h-4 w-40" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
