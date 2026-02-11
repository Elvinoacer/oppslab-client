# Testing Guide: Search & Embeddings

This guide provides a systematic approach to verify the search functionality in the Opportunities App.

## Prerequisites

1.  **Pinecone Index**: Ensure `opportunities-gemini` index exists (Dimension: 768, Metric: Cosine).
2.  **Environment Variables**: `.env` must have `PINECONE_INDEX_NAME="opportunities-gemini"` and valid API keys.
3.  **App Running**: App must be running locally (`npm start` or `npm run dev`).

---

## 1. Automated Verification

Run the included verification script to check the core components:

```bash
npx tsx scripts/verify-search.ts
```

**Expected Output:**
- ✅ Environment variables present.
- ✅ Generated embedding successfully.
- ✅ Connected to Pinecone successfully.

If any fail, address the specific error message.

---

## 2. Manual Testing (UI)

### Step 1: Start the Application

```bash
npm run dev
# or
npm start
```
Visit http://localhost:3000

### Step 2: Verify Search Page

1.  Navigate to `/search`.
2.  Enter a query (e.g., "software engineer").
3.  **Expectation**: Results should appear (or "No results found" if index is empty).
4.  **Check Logs**: Look for any "Error generating embedding" or "Pinecone Error" in your terminal.

### Step 3: Test New Opportunity Indexing

1.  Log in as **Admin** (if auth is enabled) or use the admin routes.
2.  Create a new Opportunity (or use a script to seed data).
3.  Wait for the background job (Inngest) to process the vector embedding.
    - You should see logs like "Syncing vectors..." or "Upserted 1 vector".
4.  Search for a unique keyword from that new opportunity.
5.  **Expectation**: The new opportunity should appear in search results.

---

## 3. Troubleshooting

### Common Issues

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Dimension Mismatch** | Index is D=1024 or 3072, Model is D=768 | Create new index with **768** dimensions. |
| **Pinecone 404** | Index name mismatch | Update `.env` `PINECONE_INDEX_NAME` to match Pinecone Console. |
| **403 Forbidden** | Bad API Key | Check `PINECONE_API_KEY` in `.env`. |
| **Empty Results** | No vectors in index | Run a seed script or create opportunities to populate the index. |
