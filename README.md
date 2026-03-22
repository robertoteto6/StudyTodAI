# StudyTodAI

StudyTodAI is a `Next.js` academic workspace built around project-based document ingestion, preview, and AI chat.

## Stack

- `Next.js 16` with App Router and TypeScript
- `Tailwind CSS v4`
- `Firebase Auth`, `Firestore`, and `Firebase Storage`
- `Pinecone` for vector retrieval
- `OpenRouter` for chat completions and embeddings
- Local demo fallback for auth, storage, and metadata when cloud services are not configured

## Product surface

- Bilingual `ES/EN` routes: `/es/...` and `/en/...`
- Dashboard to create projects
- Project workspace with three panes:
  - documents
  - preview
  - AI chat
- Async processing states for uploaded files: `queued`, `processing`, `ready`, `error`
- Citation-aware project chat with optional document filtering

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and configure the providers you want.

3. Start the app:

```bash
npm run dev
```

4. Optional: run the standalone processor worker:

```bash
npm run worker:dev
```

If Firebase credentials are missing, the app runs in persistent local demo mode using `.runtime/`.

## Notes

- File preview is fully wired for PDFs and images in local mode.
- Office conversion, OCR, and richer extraction are scaffolded through the async processor entrypoint and are ready to be backed by LibreOffice and Google Cloud Vision in Cloud Run.
- The current local extraction path intentionally uses demo text so the retrieval, citation, and UI flows can be exercised before external parsing services are attached.
