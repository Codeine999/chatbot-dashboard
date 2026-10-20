import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCard = ({ rows }: { rows: number }) => (
  <Card className="flex flex-col gap-4 p-5">
    <Skeleton className="h-4 w-28" />
    {Array.from({ length: rows }, (_, index) => (
      <Skeleton key={index} className="h-9 w-full" />
    ))}
  </Card>
);

/** โครงหน้าระหว่างโหลดสินค้าที่จะแก้ไข */
export const ProductEditorSkeleton = () => (
  <div className="mt-6 mb-12">
    <div className="flex items-center gap-3">
      <Skeleton className="size-11 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>

    <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-4">
        <SkeletonCard rows={3} />
        <SkeletonCard rows={2} />
      </div>
      <div className="flex flex-col gap-4">
        <SkeletonCard rows={2} />
        <SkeletonCard rows={3} />
      </div>
    </div>
  </div>
);
