"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const PdfViewer = dynamic(
  () => import("@/components/pdf-viewer/pdf-viewer").then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[34rem] w-full rounded-2xl" />,
  },
);

export function DocumentReader({ fileUrl }: { fileUrl: string }) {
  return (
    <div className="min-h-[34rem]">
      <PdfViewer fileUrl={fileUrl} />
    </div>
  );
}
