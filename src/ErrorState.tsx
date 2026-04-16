interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onChangeApiKey: () => void;
}

export default function ErrorState({ error, onRetry, onChangeApiKey }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
        <p className="mt-2 max-w-md text-sm text-red-600">{error}</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={onChangeApiKey}
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Change API Key
        </button>
      </div>
    </div>
  );
}
