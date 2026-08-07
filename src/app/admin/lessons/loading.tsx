import { AdminPageHeaderSkeleton, TableSkeleton } from "@/components/shared/loading-skeletons";

export default function AdminLessonsLoading() {
  return (
    <div>
      <AdminPageHeaderSkeleton />
      <div className="mt-6">
        <TableSkeleton cols={6} />
      </div>
    </div>
  );
}
