# TROUBLESHOOTING.md — Kairo Troubleshooting Guide

This guide addresses common issues, installation friction, API error responses, and platform-specific edge cases when running **Kairo — AI Brand Reputation Intelligence**.

---

## 1. Fast Diagnostics First

Before debugging manually, run the built-in diagnostic tool:
```bash
npm run doctor
```
The doctor script checks your Node version, package installation, `.env.local` keys, and SQLite database connectivity.

---

## 2. Common Issues & Solutions

### A. `better-sqlite3` Native Build / Compilation Error
- **Symptom:** Errors during `npm install` such as `node-gyp rebuild failed` or `Could not find any Visual Studio installation`.
- **Cause:** `better-sqlite3` requires C++ compilation tools if prebuilt binaries are unavailable for your OS/Node version.
- **Fix:**
  - **Windows:** Run `npm install --global windows-build-tools` in PowerShell (Admin), or install Visual Studio C++ Build Tools.
  - **macOS:** Run `xcode-select --install` in terminal.
  - **Linux:** Run `sudo apt install build-essential python3` (Ubuntu/Debian).

### B. `500 Server Configuration Error` on Brand Search
- **Symptom:** Clicking **Analyze brand →** returns a `500` error or red alert in drawer.
- **Cause:** Missing `BRIGHT_DATA_API_TOKEN` or `BRIGHT_DATA_COLLECTOR_ID` in `.env.local`.
- **Fix:**
  1. Open `.env.local`.
  2. Verify `BRIGHT_DATA_API_TOKEN` and `BRIGHT_DATA_COLLECTOR_ID` are set.
  3. Restart Next.js dev server (`npm run dev`).

### C. Analysis Stuck in `Pending...` State
- **Symptom:** The slide-in drawer displays `Pending...` without transitioning to `Ready`.
- **Cause:** Bright Data collector run is still executing on Perplexity AI, or `OPENAI_API_KEY` is missing/invalid.
- **Fix:**
  1. Check terminal logs for `OpenAI API Error` or `Bright Data Trigger Failed`.
  2. Ensure your OpenAI key is active and has available quota.
  3. Perplexity streaming through Bright Data proxies takes 15–30 seconds per run; allow up to 45 seconds for polling.

### D. Port 3000 Already in Use
- **Symptom:** `error - ready on 0.0.0.0:3001` or `EADDRINUSE: address already in use :::3000`.
- **Fix:** Next.js automatically falls back to port `3001`. Access Kairo at `http://localhost:3001`. To kill occupying processes on Windows, run `taskkill /F /IM node.exe`.

### E. `OPENAI_API_KEY` Missing during `npm run build`
- **Fix:** Kairo includes a dynamic fallback key for Next.js static build evaluation (`dummy-key-for-build`). Make sure you add your real OpenAI key in `.env.local` for runtime execution.

---

## 3. Getting Help

If you encounter an unlisted issue:
1. Run `npm run doctor` and capture the log output.
2. Check `docs/LOGIC.md` and `docs/ARCHITECTURE.md` for background context.
3. Open an issue on GitHub at [https://github.com/Swapnilgupta171/geo-sentinel/issues](https://github.com/Swapnilgupta171/geo-sentinel/issues).
