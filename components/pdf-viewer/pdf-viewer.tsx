"use client";

import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.05);

  useEffect(() => {
    const block = (event: MouseEvent) => event.preventDefault();
    const node = document.getElementById("paper-surface");
    node?.addEventListener("contextmenu", block);
    return () => node?.removeEventListener("contextmenu", block);
  }, []);

  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-border bg-stone-200/70 dark:bg-stone-900">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-card/95 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-24 text-center text-xs font-semibold">
            Page {page} / {numPages || "—"}
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setPage((value) => Math.min(numPages || 1, value + 1))}
            disabled={!numPages || page >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setScale((value) => Math.max(0.7, value - 0.1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setScale((value) => Math.min(1.8, value + 0.1))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        id="paper-surface"
        className="flex-1 overflow-auto select-none p-3"
        onCopy={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
      >
        <Document
          file={fileUrl}
          loading={<Skeleton className="mx-auto h-[640px] w-full max-w-2xl" />}
          error={
            <p className="p-8 text-center text-sm text-muted-foreground">
              The paper could not be loaded. Refresh and try again.
            </p>
          }
          onLoadSuccess={({ numPages: total }) => setNumPages(total)}
        >
          <Page
            pageNumber={page}
            scale={scale}
            className="mx-auto overflow-hidden rounded-lg shadow-md"
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>
      </div>
    </div>
  );
}
