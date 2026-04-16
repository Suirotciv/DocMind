import heroBackground from "./assets/hero-bg.png";
import { COHERE_MODELS } from "./services/apiClient";

export default function AppHeader() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        minHeight: "180px",
      }}
    >
      <img
        src={heroBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
      />
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-10 text-center">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 shadow-lg shadow-violet-900/50">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">DocMind</h1>
        </div>
        <p className="max-w-md text-sm text-slate-300">
          Upload a PDF, index it with <span className="font-semibold text-violet-300">Cohere AI</span>, and ask grounded questions about it.
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>
            Cohere {COHERE_MODELS.embedding}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>
            {COHERE_MODELS.chat}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
            100% client-side RAG
          </span>
        </div>
      </div>
    </div>
  );
}
