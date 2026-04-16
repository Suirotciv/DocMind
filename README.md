<img width="2004" height="1131" alt="download" src="https://github.com/user-attachments/assets/4ab49163-7fc4-496a-82f2-0551520b7993" />
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

<img width="1996" height="1893" alt="Screenshot 2026-04-15 181210" src="https://github.com/user-attachments/assets/04cea563-9abe-4856-a0a2-9a8ab44428b2" />
<img width="2003" height="1898" alt="Screenshot 2026-04-15 181238" src="https://github.com/user-attachments/assets/1b791f08-309b-47b1-973e-6b649ff51dd2" />
<img width="2009" height="1903" alt="Screenshot 2026-04-15 181315" src="https://github.com/user-attachments/assets/dd3f610d-1a8e-4a0d-8f08-405c7fe1dc47" />
![Uploading Screenshot 2026-04-15 181238.png…]()

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
