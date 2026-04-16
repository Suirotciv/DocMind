import { useCallback, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

/**
 * Configure PDF.js to use a locally bundled worker file.
 *
 * Using the local worker is more reliable than a CDN in development and
 * avoids cross-origin loading issues in browser environments.
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function hasTextContent(item: TextItem | TextMarkedContent): item is TextItem {
  return "str" in item;
}

/**
 * Metadata extracted from an uploaded PDF file.
 */
export interface PdfInfo {
  name: string;
  pageCount: number;
  charCount: number;
  text: string;
}

/**
 * Extract text from browser-uploaded PDFs with PDF.js.
 */
export function usePdfExtract() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  /**
   * Return the extracted text plus lightweight metadata used by the indexing flow.
   */
  const extractText = useCallback(async (file: File): Promise<PdfInfo | null> => {
    setIsExtracting(true);
    setExtractError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .filter(hasTextContent)
          .map((item) => item.str)
          .join(" ");

        fullText += `${pageText}\n\n`;
      }

      if (fullText.trim().length === 0) {
        throw new Error("No selectable text was found in this PDF. Try a text-based document instead of a scanned image.");
      }

      return {
        name: file.name,
        pageCount: pdf.numPages,
        charCount: fullText.length,
        text: fullText,
      };
    } catch (e: unknown) {
      setExtractError(e instanceof Error ? e.message : "Failed to extract PDF text.");
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  return { extractText, isExtracting, extractError };
}
