<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xnuVcbMqvFuqIOf1Tr9uNP7ifggV5WTw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure `GEMINI_API_KEY` in `.env.local` with your AI Studio key (no quotes or surrounding whitespace). Optionally override `GEMINI_MODEL` (`gemini-pro` by default) or `GEMINI_EMBED_MODEL` (`textembedding-gecko-001`). The server will target `https://generativelanguage.googleapis.com/v1` so that `generateContent()` uses the GEMINI API surface with an API key.
3. Run the app:
   `npm run dev`
