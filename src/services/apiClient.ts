const COHERE_API = Object.freeze({
  embeddingUrl: "https://api.cohere.com/v2/embed",
  chatUrl: "https://api.cohere.com/v2/chat",
});

export const COHERE_MODELS = Object.freeze({
  embedding: "embed-english-v3.0",
  chat: "command-r-plus-08-2024",
});

type EmbedInputType = "search_document" | "search_query";

interface CohereErrorPayload {
  message?: string;
  error?: {
    message?: string;
  };
}

interface CohereEmbeddingPayload {
  embeddings?: {
    float?: number[][];
  } | number[][];
}

interface CohereChatPayload {
  message?: {
    content?: Array<{
      text?: string;
    }>;
  };
  text?: string;
}

function createHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

async function getApiErrorMessage(response: Response): Promise<string> {
  const errorData = (await response.json().catch(() => null)) as CohereErrorPayload | null;

  return errorData?.message ?? errorData?.error?.message ?? response.statusText ?? "Unknown API error";
}

function getEmbeddings(payload: CohereEmbeddingPayload): number[][] {
  if (Array.isArray(payload.embeddings)) {
    return payload.embeddings;
  }

  if (Array.isArray(payload.embeddings?.float)) {
    return payload.embeddings.float;
  }

  return [];
}

function getChatText(payload: CohereChatPayload): string {
  const content = payload.message?.content ?? [];
  const firstText = content.find((item) => typeof item.text === "string" && item.text.trim().length > 0)?.text;

  return firstText ?? payload.text ?? "No response received.";
}

export interface ChatRequest {
  question: string;
  context: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

export const validationService = {
  validateApiKey(apiKey: string): boolean {
    const trimmedKey = apiKey.trim();

    if (trimmedKey.length === 0) {
      throw new Error("API key is required");
    }

    if (trimmedKey.includes(" ")) {
      throw new Error("API key should not contain spaces");
    }

    return true;
  },

  validateTextsForEmbedding(texts: string[]): boolean {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error("Texts must be a non-empty array");
    }

    const hasEmptyText = texts.some((text) => typeof text !== "string" || text.trim().length === 0);

    if (hasEmptyText) {
      throw new Error("All texts must be non-empty strings");
    }

    return true;
  },

  validateChatRequest(request: ChatRequest): boolean {
    if (!request.question || request.question.trim().length === 0) {
      throw new Error("Question is required");
    }

    if (request.question.length > 5000) {
      throw new Error("Question is too long (max 5000 characters)");
    }

    if (!request.context || request.context.trim().length === 0) {
      throw new Error("Context is required");
    }

    if (!Array.isArray(request.history)) {
      throw new Error("History must be an array");
    }

    return true;
  },
};

export const embeddingService = {
  async embed(
    texts: string[],
    apiKey: string,
    inputType: EmbedInputType
  ): Promise<number[][]> {
    validationService.validateApiKey(apiKey);
    validationService.validateTextsForEmbedding(texts);

    // Batching is handled by the caller (App.tsx) so progress can be tracked per
    // batch. This function sends a single batch and returns its embeddings.
    const response = await fetch(COHERE_API.embeddingUrl, {
      method: "POST",
      headers: createHeaders(apiKey),
      body: JSON.stringify({
        model: COHERE_MODELS.embedding,
        input_type: inputType,
        texts,
        embedding_types: ["float"],
      }),
    });

    if (!response.ok) {
      const message = await getApiErrorMessage(response);
      throw new Error(`Embedding API error: ${response.status} - ${message}`);
    }

    const payload = (await response.json()) as CohereEmbeddingPayload;
    const embeddings = getEmbeddings(payload);

    if (embeddings.length !== texts.length) {
      throw new Error("Embedding response length did not match the request length.");
    }

    return embeddings;
  },
};

export const chatService = {
  async chat(request: ChatRequest, apiKey: string): Promise<string> {
    validationService.validateApiKey(apiKey);
    validationService.validateChatRequest(request);

    const systemPrompt = `You are a helpful document assistant. Answer the user's question based only on the context excerpts provided below. If the answer is not in the context, say "I couldn't find that information in the document." Be concise and cite which excerpt number(s) you used.

CONTEXT:
${request.context}`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...request.history,
      { role: "user" as const, content: request.question },
    ];

    const response = await fetch(COHERE_API.chatUrl, {
      method: "POST",
      headers: createHeaders(apiKey),
      body: JSON.stringify({
        model: COHERE_MODELS.chat,
        messages,
      }),
    });

    if (!response.ok) {
      const message = await getApiErrorMessage(response);
      throw new Error(`Chat API error: ${response.status} - ${message}`);
    }

    const payload = (await response.json()) as CohereChatPayload;
    return getChatText(payload);
  },
};
