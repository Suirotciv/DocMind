import type { PdfInfo } from "./hooks/usePdfExtract";
import type { Chunk } from "./utils/rag";

export interface IndexedDoc {
  info: PdfInfo;
  chunks: Chunk[];
}
