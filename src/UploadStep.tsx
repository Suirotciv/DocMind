import { useCallback, useRef, useState, type DragEvent } from "react";

interface UploadStepProps {
  onUpload: (file: File) => void;
  isExtracting: boolean;
  extractError: string | null;
}

const uploadTips = [
  "Use text-based PDFs (not scanned images).",
  "Smaller PDFs (under 50 pages) index faster.",
  "Ask specific questions about the document content.",
  'Try follow-ups like "Explain more" or "Give an example."',
];

export default function UploadStep({ onUpload, isExtracting, extractError }: UploadStepProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);

      const file = event.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        onUpload(file);
      }
    },
    [onUpload]
  );

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!isExtracting) {
            inputRef.current?.click();
          }
        }}
        className={`
          w-full max-w-lg cursor-pointer select-none rounded-2xl border-2 border-dashed p-12 text-center transition-all
          ${dragging ? "border-violet-400 bg-violet-50" : "border-slate-300 bg-white hover:border-violet-400 hover:bg-violet-50/50"}
          ${isExtracting ? "cursor-not-allowed opacity-70" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload(file);
            }
          }}
        />

        {isExtracting ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <p className="font-medium text-slate-600">Extracting PDF text...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100">
              <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">Drop your PDF here</p>
              <p className="mt-1 text-sm text-slate-500">
                or <span className="text-violet-600 underline underline-offset-2">click to browse</span>
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Supports text-based PDFs: academic papers, reports, books, contracts, and more.
            </p>
          </div>
        )}
      </div>

      {extractError && (
        <div className="mt-4 w-full max-w-lg rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {extractError}
        </div>
      )}

      <div className="mt-8 w-full max-w-lg rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tips for best results</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          {uploadTips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
