import { useEffect, useRef, useState } from "react";
import { chatService, embeddingService } from "./services/apiClient";
import type { IndexedDoc } from "./indexedDoc";
import { retrieveTopK, type ChatMessage } from "./utils/rag";

interface ChatPanelProps {
  doc: IndexedDoc;
  apiKey: string;
  onReset: () => void;
}

type ChatPanelMessage = ChatMessage & { sources?: string[] };

interface SuggestedPrompt {
  title: string;
  description: string;
  prompt: string;
}

const suggestedPrompts: SuggestedPrompt[] = [
  {
    title: "3-point summary",
    description: "Get a fast overview in plain English.",
    prompt: "Summarize this document in 3 bullet points written in plain English.",
  },
  {
    title: "Key facts",
    description: "Pull out the strongest takeaways with evidence.",
    prompt: "List the 5 most important facts from this document and cite the excerpt numbers that support each one.",
  },
  {
    title: "Names, dates, numbers",
    description: "Extract the details that matter most.",
    prompt: "Pull out the most important names, dates, numbers, and metrics mentioned in this document.",
  },
  {
    title: "Action items",
    description: "Surface recommendations and next steps.",
    prompt: "Identify any decisions, recommendations, or next steps described in this document. If there are none, say so clearly.",
  },
  {
    title: "Explain it simply",
    description: "Make the document easy for a beginner to follow.",
    prompt: "Explain this document to someone new to the topic using simple language, then define any important terms.",
  },
  {
    title: "Smart follow-ups",
    description: "Show what else the document can answer well.",
    prompt: "Suggest 5 strong follow-up questions someone could ask about this document, then answer the best one.",
  },
];

function formatSourceExcerpt(text: string, maxLength = 120) {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}...`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ChatPanel({ doc, apiKey, onReset }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatPanelMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) {
      return;
    }

    setError(null);
    const question = text.trim();
    const history: ChatMessage[] = messages.map(({ role, content }) => ({ role, content }));
    setInput("");
    setMessages((previous) => [...previous, { role: "user", content: question }]);
    setIsThinking(true);

    try {
      const [queryEmbedding] = await embeddingService.embed([question], apiKey, "search_query");

      if (!queryEmbedding || queryEmbedding.length === 0) {
        throw new Error("The question embedding request did not return any vectors.");
      }

      const topChunks = retrieveTopK(queryEmbedding, doc.chunks, 5);

      if (topChunks.length === 0) {
        throw new Error("No indexed content is available yet. Try re-uploading a PDF with selectable text.");
      }

      const answer = await chatService.chat(
        {
          question,
          context: topChunks.map((chunk, index) => `[${index + 1}] ${chunk.text}`).join("\n\n"),
          history,
        },
        apiKey
      );

      const sources = topChunks.map((chunk) => formatSourceExcerpt(chunk.text));
      setMessages((previous) => [...previous, { role: "assistant", content: answer, sources }]);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Something went wrong. Check your API key and try again."));
      setMessages((previous) => previous.slice(0, -1));
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
      <div className="border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
            <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{doc.info.name}</p>
            <p className="text-xs text-slate-500">
              {doc.info.pageCount} pages · {doc.chunks.length} chunks · {doc.info.charCount.toLocaleString()} chars
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="ml-2 shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
          >
            New PDF
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          {messages.length === 0 && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(200px,0.35fr)] lg:items-start">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>
                <div className="mt-4 max-w-2xl">
                  <h3 className="text-xl font-bold text-slate-900">Your document is ready.</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Start with one of these prompts or ask your own question about{" "}
                    <span className="font-medium text-violet-600">{doc.info.name}</span>.
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt.title}
                      type="button"
                      onClick={() => sendMessage(prompt.prompt)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-violet-300 hover:bg-violet-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{prompt.title}</p>
                          <p className="mt-1 text-[11px] leading-4 text-slate-500">{prompt.description}</p>
                        </div>
                        <svg className="h-4 w-4 shrink-0 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <aside className="space-y-2.5 rounded-3xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-600">Document</p>
                  <h4 className="mt-1 text-sm font-semibold text-slate-900">{doc.info.name}</h4>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Pages</p>
                    <p className="text-sm font-semibold text-slate-900">{doc.info.pageCount}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Chunks</p>
                    <p className="text-sm font-semibold text-slate-900">{doc.chunks.length}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Characters</p>
                    <p className="text-sm font-semibold text-slate-900">{doc.info.charCount.toLocaleString()}</p>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shadow">
                      AI
                    </div>
                  )}
                  <div
                    className={`flex max-w-[92%] flex-col space-y-2 lg:max-w-[84%] xl:max-w-[80%] ${
                      message.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "rounded-tr-sm bg-violet-600 text-white shadow"
                          : "rounded-tl-sm border border-slate-100 bg-white text-slate-800 shadow-sm"
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                      <details className="group w-full">
                        <summary className="flex cursor-pointer list-none items-center gap-1 select-none text-xs text-slate-400 transition hover:text-violet-500">
                          <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          {message.sources.length} source excerpt{message.sources.length > 1 ? "s" : ""} used
                        </summary>
                        <div className="mt-2 space-y-1">
                          {message.sources.map((source, sourceIndex) => (
                            <div
                              key={`${sourceIndex}-${source}`}
                              className="rounded-lg border-l-2 border-violet-300 bg-slate-100 px-3 py-2 text-xs text-slate-500"
                            >
                              [{sourceIndex + 1}] {source}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                      You
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isThinking && (
            <div className="flex justify-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shadow">
                AI
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-5 py-4 shadow-sm">
                <span className="flex gap-1">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                      style={{ animationDelay: `${index * 150}ms` }}
                    />
                  ))}
                </span>
                <span className="ml-1 text-xs text-slate-400">Searching document...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.04)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Quick prompts</span>
            {suggestedPrompts.slice(0, 3).map((prompt) => (
              <button
                key={`quick-${prompt.title}`}
                type="button"
                onClick={() => sendMessage(prompt.prompt)}
                disabled={isThinking}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {prompt.title}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  sendMessage(input);
                }
              }}
              placeholder="Ask anything about the document..."
              disabled={isThinking}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isThinking}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
