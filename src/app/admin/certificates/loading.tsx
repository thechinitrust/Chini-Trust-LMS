import { AdminPageHeaderSkeleton, TableSkeleton } from "@/components/shared/loading-skeletons";

export default function AdminCertificatesLoading() {
  return (
    <div>
      <AdminPageHeaderSkeleton />
      <div className="mt-6">
        <TableSkeleton cols={4} />
      </div>
    </div>
  );
}
