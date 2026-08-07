import { AdminPageHeaderSkeleton, TableSkeleton } from "@/components/shared/loading-skeletons";

export default function AdminEventsLoading() {
  return (
    <div>
      <AdminPageHeaderSkeleton />
      <div className="mt-6">
        <TableSkeleton cols={5} />
      </div>
    </div>
  );
}
