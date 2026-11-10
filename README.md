# Letterly AI — AI Cover Letter Generator

A responsive Next.js SaaS-style cover letter builder with server-side AI generation, editing actions, browser-saved history, and PDF/DOCX export.

## Stack
Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, Lucide, OpenAI-compatible Chat Completions API, jsPDF and docx.

## Run locally
1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your server-side `OPENAI_API_KEY` (optional for demo; required for real AI).
5. Run `npm run dev` and open http://localhost:3000.

## Environment
- `OPENAI_API_KEY`: secret API key, server-side only.
- `OPENAI_MODEL`: optional model name; defaults to `gpt-4o-mini`.

Without the key, AI generation/editing returns a clear setup error. The app's Demo mode uses a local sample letter and is explicitly labelled as sample content, not AI output.

## Deploy to Vercel
Import this GitHub repository into Vercel, select Next.js, set the root directory to `./`, add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` under Project Settings → Environment Variables, then deploy. Pushes to the connected production branch deploy automatically.

## Current scope
Cover letters are stored in the browser's localStorage on the current device. Authentication, cloud sync, Supabase/Firebase persistence, Google sign-in, and multi-device history are not enabled in this initial release. Do not treat local browser storage as an account-backed database.

## Security
The OpenAI key is accessed only by API routes and is never sent to the browser. Add rate limiting and abuse monitoring before opening generation to a large public audience.
