"use client";

import { useState } from "react";
import { Document, Page } from "react-pdf";
import Spinner from "./Spinner";

interface PDFViewerProps {
  url: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center p-4">
            <Spinner />
          </div>
        }
        error={
          <div className="text-red-400 text-sm bg-red-500/10 rounded-md p-2">
            Failed to load PDF
          </div>
        }
      >
        <Page
          pageNumber={pageNumber}
          className="max-w-full"
          loading={
            <div className="flex items-center justify-center p-4">
              <Spinner />
            </div>
          }
        />
      </Document>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
          disabled={pageNumber <= 1}
          className="px-3 py-1 rounded-md bg-kairo-black-a20/40 text-kairo-white/90 disabled:opacity-50"
        >
          Previous
        </button>

        <p className="text-kairo-white">
          Page {pageNumber} of {numPages}
        </p>

        <button
          onClick={() =>
            setPageNumber((page) => Math.min(numPages || page, page + 1))
          }
          disabled={pageNumber >= (numPages || 1)}
          className="px-3 py-1 rounded-md bg-kairo-black-a20/40 text-kairo-white/90 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
