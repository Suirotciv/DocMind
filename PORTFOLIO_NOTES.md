# Portfolio Notes

## 30-Second Pitch

DocMind is a frontend-only RAG demo for PDF Q&A. It extracts text in the browser with PDF.js, chunks and embeds the document with Cohere, retrieves relevant passages via cosine similarity, and returns grounded answers with source excerpts visible.

## What It Covers

- Browser file APIs and PDF.js text extraction
- Text chunking with overlap and in-memory vector retrieval
- Cohere embeddings and chat API integration from a typed service layer
- Multi-step async UI states (upload -> index -> chat)

## Architecture

1. `usePdfExtract` handles PDF.js parsing and returns extracted text and metadata.
2. `chunkText` splits the document into overlapping passages.
3. `embeddingService` batches chunks to Cohere and stores vectors in memory.
4. `retrieveTopK` ranks chunks against the embedded query using cosine similarity.
5. `chatService` sends only the top excerpts to the model; the UI shows which passages were used.

## Honest Tradeoffs

- Text-based PDFs only; scanned PDFs need OCR first.
- Retrieval is in-memory and limited to one document.
- No backend, database, or auth - intentional scope for a single-user demo.

## Possible Follow-Ups

- OCR support for scanned PDFs
- Tests for chunking and retrieval utilities
- Multi-document support with document switching
- Page-level citations
- PDF-to-Markdown and Markdown-to-PDF conversion

## Resume Bullets

- Built a client-side RAG app for PDF Q&A using React, TypeScript, PDF.js, and Cohere
- Implemented in-browser document indexing: chunking, embedding, cosine-similarity retrieval, grounded chat
- Handled async UI states across API key entry, file upload, indexing, and chat

## GitHub Tips

- Add 2-3 screenshots: landing, upload flow, chat with source excerpts
- Repo description: `Client-side PDF RAG demo - React, TypeScript, PDF.js, Cohere`
- Pin if it becomes one of your stronger early projects
