-- Create comparison_results table for storing shareable comparison data
CREATE TABLE public.comparison_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on share_id for faster lookups
CREATE INDEX idx_comparison_results_share_id ON public.comparison_results(share_id);

-- Enable Row Level Security
ALTER TABLE public.comparison_results ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read comparison results (public viewing)
CREATE POLICY "Anyone can view comparison results"
ON public.comparison_results
FOR SELECT
USING (true);

-- Policy to allow anyone to insert comparison results (for now, since you're the only uploader)
-- You can later add authentication to restrict this to admin users only
CREATE POLICY "Anyone can create comparison results"
ON public.comparison_results
FOR INSERT
WITH CHECK (true);