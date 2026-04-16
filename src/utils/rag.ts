export interface Chunk {
  id: number;
  text: string;
  pageNum?: number;
  embedding?: number[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Split long text into overlapping chunks so retrieval has enough context
// without sending the whole document to the model.
export function chunkText(text: string, chunkSize = 500, overlap = 80): Chunk[] {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();

  if (!normalizedText) {
    return [];
  }

  const sentences = normalizedText.split(/(?<=[.?!])\s+/);
  const chunks: Chunk[] = [];
  let current = "";
  let id = 0;

  for (const sentence of sentences) {
    const nextChunk = current ? `${current} ${sentence}` : sentence;

    if (nextChunk.length > chunkSize && current.length > 0) {
      chunks.push({ id, text: current.trim() });
      id += 1;

      const overlapText = current.slice(-overlap);
      current = `${overlapText} ${sentence}`.trim();
      continue;
    }

    current = nextChunk;
  }

  if (current.trim().length > 20) {
    chunks.push({ id, text: current.trim() });
  }

  return chunks;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Rank indexed chunks by semantic similarity and return the strongest matches.
export function retrieveTopK(queryEmbedding: number[], chunks: Chunk[], topK = 5): Chunk[] {
  return chunks
    .filter((chunk) => Array.isArray(chunk.embedding) && chunk.embedding.length > 0)
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding ?? []),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk);
}
