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
  search_corpus TEXT NOT NULL,
  embedding VECTOR(768),
  status TEXT NOT NULL DEFAULT 'found' CHECK (status IN ('found', 'claimed', 'verified')),
  claimant_name TEXT,
  claimed_at TIMESTAMPTZ
);

-- Index for vector similarity search using Cosine distance
CREATE INDEX IF NOT EXISTS items_embedding_idx 
ON public.items 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Full-text / B-tree indexes for fast filtering
CREATE INDEX IF NOT EXISTS items_status_idx ON public.items (status);
CREATE INDEX IF NOT EXISTS items_campus_zone_idx ON public.items (campus_zone);
CREATE INDEX IF NOT EXISTS items_category_idx ON public.items (category);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON public.items (created_at DESC);

-- RPC for Vector Matching Function
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

-- Storage Bucket Setup for 'items'
-- In Supabase dashboard: Storage -> Create Bucket -> Name: 'items' (Public: true)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('items', 'items', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policy allowing public read and authenticated/anon uploads
CREATE POLICY IF NOT EXISTS "Public Access items" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'items');

CREATE POLICY IF NOT EXISTS "Allow Public Upload items" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'items');

