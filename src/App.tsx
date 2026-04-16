import { useState } from "react";
import ApiKeyStep from "./ApiKeyStep";
import AppHeader from "./AppHeader";
import ChatPanel from "./ChatPanel";
import ErrorState from "./ErrorState";
import IndexingStep from "./IndexingStep";
import UploadStep from "./UploadStep";
import { usePdfExtract } from "./hooks/usePdfExtract";
import type { IndexedDoc } from "./indexedDoc";
import { COHERE_MODELS, embeddingService, validationService } from "./services/apiClient";
import { chunkText, type Chunk } from "./utils/rag";

type AppStep = "apikey" | "upload" | "indexing" | "ready" | "error";

const INDEXING_BATCH_SIZE = 30;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  const [step, setStep] = useState<AppStep>("apikey");
  const [apiKey, setApiKey] = useState("");
  const [indexedDoc, setIndexedDoc] = useState<IndexedDoc | null>(null);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [indexingLabel, setIndexingLabel] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { extractText, isExtracting, extractError } = usePdfExtract();

  const handleApiKey = (key: string) => {
    try {
      validationService.validateApiKey(key);
      setGlobalError(null);
      setApiKey(key);
      setStep("upload");
    } catch (error: unknown) {
      setGlobalError(getErrorMessage(error, "Invalid API key."));
      setStep("apikey");
    }
  };

  const handleFileUpload = async (file: File) => {
    setGlobalError(null);

    const pdfInfo = await extractText(file);
    if (!pdfInfo) {
      return;
    }

    setStep("indexing");
    setIndexingProgress(10);
    setIndexingLabel("Splitting text into chunks...");

    try {
      await wait(200);

      const chunks = chunkText(pdfInfo.text, 500, 80);
      if (chunks.length === 0) {
        throw new Error("No searchable text was found in the PDF. Try a text-based document instead.");
      }

      setIndexingProgress(25);
      setIndexingLabel(`Created ${chunks.length} chunks. Generating embeddings...`);

      const texts = chunks.map((chunk) => chunk.text);
      const allEmbeddings: number[][] = [];

      for (let index = 0; index < texts.length; index += INDEXING_BATCH_SIZE) {
        const batch = texts.slice(index, index + INDEXING_BATCH_SIZE);
        const batchEmbeddings = await embeddingService.embed(batch, apiKey, "search_document");
        allEmbeddings.push(...batchEmbeddings);

        const progress = 25 + ((index + batch.length) / texts.length) * 70;
        setIndexingProgress(Math.min(progress, 95));
        setIndexingLabel(`Embedding chunk ${Math.min(index + batch.length, texts.length)} / ${texts.length}...`);
      }

      const embeddedChunks: Chunk[] = chunks.map((chunk, index) => ({
        ...chunk,
        embedding: allEmbeddings[index] ?? [],
      }));

      setIndexingProgress(100);
      setIndexingLabel("Done!");
      await wait(400);
      setIndexedDoc({ info: pdfInfo, chunks: embeddedChunks });
      setStep("ready");
    } catch (error: unknown) {
      setGlobalError(getErrorMessage(error, "Indexing failed. Check your API key."));
      setStep("error");
    }
  };

  const handleReset = () => {
    setIndexedDoc(null);
    setIndexingProgress(0);
    setIndexingLabel("");
    setGlobalError(null);
    setStep("upload");
  };

  const handleChangeApiKey = () => {
    setApiKey("");
    setIndexedDoc(null);
    setIndexingProgress(0);
    setIndexingLabel("");
    setGlobalError(null);
    setStep("apikey");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader />

      <main className="flex min-h-0 flex-1 flex-col">
        {step === "apikey" && <ApiKeyStep error={globalError} onSubmit={handleApiKey} />}

        {step === "upload" && (
          <UploadStep
            onUpload={handleFileUpload}
            isExtracting={isExtracting}
            extractError={extractError}
          />
        )}

        {step === "indexing" && <IndexingStep progress={indexingProgress} label={indexingLabel} />}

        {step === "ready" && indexedDoc && (
          <div className="flex min-h-0 flex-1 flex-col">
            <ChatPanel doc={indexedDoc} apiKey={apiKey} onReset={handleReset} />
          </div>
        )}

        {step === "error" && (
          <ErrorState
            error={globalError}
            onRetry={handleReset}
            onChangeApiKey={handleChangeApiKey}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <p className="mx-auto w-full max-w-6xl px-4 py-3 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          Powered by Cohere {COHERE_MODELS.embedding} + {COHERE_MODELS.chat}. Answers stay grounded in your document.
        </p>
      </footer>
    </div>
  );
}
