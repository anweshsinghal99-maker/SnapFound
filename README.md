# ⚡ SnapFound · Multimodal AI Lost & Found Radar

> **Zero-Typing Multimodal AI Campus Asset Recovery Platform**  
> Powered by **Next.js 15**, **Google Gemini 2.5 Flash**, and **Supabase pgvector (768-D)**.

---

## 🌟 Overview

Traditional campus lost-and-found systems fail for three reasons:
1. **High Friction**: Students and staff rarely take time to fill out lengthy manual forms.
2. **Vocabulary Mismatch**: A finder writes *"metal flask"*, while the owner searches for *"black Hydro Flask"*, causing keyword searches to miss completely.
3. **Theft & False Claims**: Anyone browsing a public listing can claim someone else's expensive electronics or gear.

**SnapFound solves all three in 3 seconds:**
- **Zero-Typing Discovery**: The finder takes a single photo. Gemini Vision extracts the item title, category, visual tags, and a public description.
- **Anti-Theft Shield**: The AI deliberately isolates and withholds **one secret identifying feature** (such as an underside sticker, serial engraving, scratch, or wallpaper) from public view and generates an ownership challenge question.
- **768-Dimensional Vector Search**: Owners search in natural plain English (e.g., *"black water bottle with dent near library"*), matched via cosine similarity on Supabase `pgvector`.
- **AI Verification Judge**: When a claimant responds to the challenge, Gemini AI evaluates semantic equivalence to verify ownership and unlocks an authorized **4-digit Handover PIN** and **Digital Handover Pass**.

---

## 🚀 Key Features

### 1. Zero-Typing Finder Pipeline (`POST /api/items/analyze-and-create`)
- Upload an image or snap directly using live device webcam (`<input type="file" capture="environment" />`).
- Analyzes attributes using Gemini Vision with strict JSON Structured Outputs.
- Computes a 768-dimensional vector embedding using Gemini embedding models.
- Generates a random 4-digit handover PIN and stores the record in Supabase.

### 2. Semantic Vector Matcher (`POST /api/items/search`)
- Converts natural language queries into 768-D query vectors.
- Calls Supabase `match_items()` RPC utilizing `vector_cosine_ops`.
- Returns sorted matches with dynamic percentage confidence badges (`98% MATCH`).
- Never exposes `secret_detail` or `handover_pin` to client responses.

### 3. Anti-Theft Verification Judge (`POST /api/items/verify-claim`)
- Evaluates the claimant's answer against the server-side ground truth.
- Allows semantic equivalence (e.g. *"Red Spider-Man sticker on bottom"* matches *"spiderman decal on base"*).
- If verified, sets status to `verified` and unlocks the 4-digit PIN and custody pickup location.
- If rejected, returns polite feedback without leaking the protected secret detail.

### 4. 1-Click Demo Seeder (`POST /api/demo/seed`)
- Populates the database with 6 realistic campus found items across sectors (*Main Library 2F, LT-102, Hostel F Mess, Indoor Badminton Court*) with real embeddings.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **AI Vision & Embeddings**: Official [`@google/genai`](https://www.npmjs.com/package/@google/genai) SDK (`gemini-2.5-flash`, `gemini-3.8-flash`, `text-embedding-004`, `gemini-embedding-001`)
- **Database & Storage**: [Supabase PostgreSQL](https://supabase.com/) with [`pgvector`](https://github.com/pgvector/pgvector) extension and Supabase Storage

---

## 📋 Environment Variables

Create a `.env.local` file in the root directory (or configure these in Vercel):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Google Gemini API Key (from Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_API_KEY=your-gemini-api-key
```

> **Note**: An example template is available in `.env.example`.

---

## 🗄️ Database Setup (Supabase)

Run the SQL migration script located at [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create Items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Electronics', 'ID & Keys', 'Bottles & Gear', 'Books & Calculators', 'Accessories', 'Other')),
  image_url TEXT NOT NULL,
  campus_zone TEXT NOT NULL,
  drop_off_mode TEXT NOT NULL,
  finder_contact TEXT,
  ai_public_tags TEXT[] NOT NULL DEFAULT '{}',
  public_description TEXT NOT NULL,
  secret_detail TEXT NOT NULL,
  verification_question TEXT NOT NULL,
  handover_pin TEXT NOT NULL,
  embedding VECTOR(768),
  status TEXT NOT NULL DEFAULT 'found' CHECK (status IN ('found', 'claimed', 'verified')),
  claimant_name TEXT,
  claimed_at TIMESTAMPTZ
);

-- Cosine index
CREATE INDEX IF NOT EXISTS items_embedding_idx 
ON public.items 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- RPC for Vector Search
CREATE OR REPLACE FUNCTION match_items (
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.35,
  match_count INT DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  title TEXT,
  category TEXT,
  image_url TEXT,
  campus_zone TEXT,
  drop_off_mode TEXT,
  finder_contact TEXT,
  ai_public_tags TEXT[],
  public_description TEXT,
  verification_question TEXT,
  status TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    items.id,
    items.created_at,
    items.title,
    items.category,
    items.image_url,
    items.campus_zone,
    items.drop_off_mode,
    items.finder_contact,
    items.ai_public_tags,
    items.public_description,
    items.verification_question,
    items.status,
    (1 - (items.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.items
  WHERE items.embedding IS NOT NULL 
    AND (1 - (items.embedding <=> query_embedding)) > match_threshold
  ORDER BY items.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 💻 Local Development

```bash
# 1. Clone repository
git clone https://github.com/anweshsinghal99-maker/SnapFound.git
cd SnapFound

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Add your Supabase and Gemini keys to .env.local

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploying to Vercel

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: production-ready SnapFound AI lost & found"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your **`SnapFound`** GitHub repository.
4. In **Project Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
5. Click **Deploy**. Vercel will automatically build and publish your app!

---

## 🎯 60-Second Hackathon Demo Script

1. **Seed Data**: Click the **"Seed Demo Data"** button in the navbar to load 6 realistic campus items with 768-D embeddings.
2. **Semantic Search**: Click the quick demo pill **`"black water bottle near library"`** to watch vector search rank the Hydro Flask at the top.
3. **Anti-Theft Challenge**: Click **"Verify & Claim Item"**. Point out that the ground-truth sticker is masked and the challenge question is generated dynamically.
4. **AI Judge Evaluation**: Click **"⚡ Try Demo Answer"** and click **"Verify Ownership with Gemini AI"**.
5. **Verified Handover Pass**: Experience the confetti celebration, view the unmasked photo, copy the **4-digit Handover PIN** (`[ 4 8 2 9 ]`), and present the QR retrieval pass.
6. **Live Camera Capture**: Click **"+ Snap Found Item"** to demo live camera capture and real-time attribute extraction.

---

## 📄 License

MIT License. Built for university campus hackathons with ❤️.
