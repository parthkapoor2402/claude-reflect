# Claude Reflect

**AI Output Transparency Layer — PM Case Study**

Claude Reflect is a reasoning transparency layer that surfaces alongside AI responses. It shows the assumptions made, confidence zones, completeness gaps, and judgment prompts — helping users evaluate AI outputs without replacing human judgment.

## The Problem

88% of AI users have been burned by an incorrect or incomplete AI output in real work. Yet the product gives no mechanism to distinguish high-confidence from low-confidence responses.

## The Solution

Claude Reflect runs a meta-reasoning pass after every response and surfaces 4 dimensions of output quality — helping users apply their judgment precisely where it's needed.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- AI: Groq API (llama-3.3-70b + llama-3.1-8b-instant)
- Deploy: Vercel

## Local Setup

1. Clone repo
2. `cd server && npm install` && add `GROQ_API_KEY` to `.env` (project root)
3. `cd client && npm install`
4. Run server: `cd server && npm run dev`
5. Run client: `cd client && npm run dev`

With the Vite proxy, API calls use `/api/*` on port 5173 — no hardcoded localhost URL in the client.

## Survey Data

N=25 | Completeness trust: 3.16/5 | 88% burned by AI errors | 56% use passive/no verification

*Built for NextLeap PM Fellowship — May 2026*
