# Nikki Hub

Personal AI command centre — Next.js + Claude (claude-sonnet-4-6).

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Run in development:
   ```
   npm run dev
   ```

   Open http://localhost:3000

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- @anthropic-ai/sdk (streaming)

## Features

- Streaming chat with Claude
- Quick-prompt buttons for court case tasks
- Defence deadline countdown
- Dark purple UI
- Mobile-friendly