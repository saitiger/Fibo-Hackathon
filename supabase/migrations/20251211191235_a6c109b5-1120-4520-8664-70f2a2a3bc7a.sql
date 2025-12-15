-- Create table to store generated images history
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  prompt_json JSONB NOT NULL,
  refinement TEXT,
  negative_prompt TEXT,
  guidance_scale INTEGER,
  seed BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow public access (no auth in this app)
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read images
CREATE POLICY "Allow public read" ON public.generated_images FOR SELECT USING (true);

-- Allow anyone to insert images
CREATE POLICY "Allow public insert" ON public.generated_images FOR INSERT WITH CHECK (true);