# DocMind

DocMind is a browser-based PDF question-answering app built as a learning exercise for RAG. Users upload a text-based PDF, the app extracts and chunks the text, generates embeddings with Cohere, retrieves the most relevant passages for each question, and returns answers with source excerpts shown.

## How It Works

1. A user uploads a text-based PDF in the browser.
2. PDF.js extracts the text locally - no server involved.
3. The app chunks the text with overlap and requests document embeddings from Cohere.
4. When the user asks a question, the app embeds the query and ranks chunks with cosine similarity.
5. The top matching excerpts are sent to the chat model, and the response includes the supporting source snippets.

## Features

- Client-side PDF text extraction with PDF.js
- Cohere embeddings and chat
- Text chunking with overlap
- Grounded answers with visible source excerpts
- Progress feedback during extraction and indexing
- Example prompt shortcuts

## Screenshots

| Landing and API key setup | Upload flow |
| --- | --- |
| ![DocMind landing page and API key entry](docs/screenshots/landing-api-key-xs.jpg) | ![DocMind PDF upload screen](docs/screenshots/upload-screen-xs.jpg) |
| Chat workspace | Example grounded response |
| ![DocMind chat ready state](docs/screenshots/chat-ready-xs.jpg) | ![DocMind grounded response example](docs/screenshots/chat-response-xs.jpg) |

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- PDF.js
- Cohere API
- `vite-plugin-singlefile`

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A Cohere API key from `https://dashboard.cohere.com/api-keys`

### Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, enter a Cohere API key, and upload a text-based PDF.

### Available Scripts

```bash
npm run dev        # start dev server
npm run typecheck  # type-check only
npm run build      # production build
npm run check      # typecheck + build
npm run preview    # preview production build
```

## Build and Deployment

`npm run build` produces a static build in `dist/`. The Vite config uses a relative base path for compatibility with GitHub Pages, Netlify, and Cloudflare Pages.

Frontend-only: no database, no custom API server, no stored API key.

## Project Structure

```
src/
  App.tsx               # top-level state and step transitions
  ApiKeyStep.tsx        # API key entry
  UploadStep.tsx        # file upload
  IndexingStep.tsx      # indexing progress
  ChatPanel.tsx         # chat UI
  ErrorState.tsx        # error display
  AppHeader.tsx         # header/hero
  hooks/
    usePdfExtract.ts    # PDF.js extraction hook
  services/
    apiClient.ts        # Cohere API calls
  utils/
    rag.ts              # chunking and retrieval utilities
```

## Limitations

- Text-based PDFs only - scanned PDFs need OCR first.
- Retrieval is in-memory and scoped to one document at a time.
- No persistence, authentication, or multi-user support.

## Future Ideas

- OCR support for scanned PDFs
- Tests for chunking and retrieval utilities
- Multi-document support
- Page-level citations instead of excerpt-only
- PDF-to-Markdown export
- Auto-summary or structured extraction on upload

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
