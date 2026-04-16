interface IndexingStepProps {
  progress: number;
  label: string;
}

export default function IndexingStep({ progress, label }: IndexingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-20">
      <div className="text-center">
        <p className="text-lg font-bold text-slate-800">Indexing your document...</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>

      <div className="w-full max-w-xs space-y-1.5">
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-xs text-slate-400">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
