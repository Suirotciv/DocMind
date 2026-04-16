import { useState } from "react";

interface ApiKeyStepProps {
  error: string | null;
  onSubmit: (key: string) => void;
}

const onboardingSteps = [
  {
    icon: "PDF",
    title: "1. Upload PDF",
    description: "Your PDF is parsed entirely in the browser. Nothing is sent to a third-party server.",
  },
  {
    icon: "RAG",
    title: "2. Index",
    description: "The app chunks the text and generates semantic embeddings for retrieval.",
  },
  {
    icon: "Q&A",
    title: "3. Ask",
    description: "Questions are matched to the most relevant chunks before the model answers.",
  },
];

const techStack = ["React 19", "TypeScript", "PDF.js", "Cohere API"];

export default function ApiKeyStep({ error, onSubmit }: ApiKeyStepProps) {
  const [key, setKey] = useState("");

  const submitKey = () => {
    const trimmedKey = key.trim();
    if (trimmedKey) {
      onSubmit(trimmedKey);
    }
  };

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-start">
        <section className="space-y-8">
          <div className="max-w-3xl">
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Ask questions about any PDF, grounded in the actual text.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Upload a text-based PDF, generate embeddings with Cohere, retrieve relevant chunks, and get answers with visible source excerpts.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {techStack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {onboardingSteps.map((step) => (
                <div key={step.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">{step.icon}</span>
                  <h3 className="mt-2 text-sm font-bold text-slate-800">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Enter Your Cohere API Key</h3>
            <p className="mt-1 text-center text-sm text-slate-500">
              Get a free key at{" "}
              <a
                href="https://dashboard.cohere.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-violet-600 underline underline-offset-2"
              >
                dashboard.cohere.com
              </a>
              . Your key stays in your browser only.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitKey();
                }
              }}
              placeholder="sk-********************************"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              type="button"
              onClick={submitKey}
              disabled={!key.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-3">
            <p className="flex items-start gap-2 text-xs text-amber-700">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Your API key is never sent to any server other than Cohere's official API. It is stored only in this browser tab's memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
