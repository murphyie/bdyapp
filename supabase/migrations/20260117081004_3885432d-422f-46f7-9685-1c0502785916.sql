-- Add background_word column to settings table for celebration page 3D text
ALTER TABLE public.settings 
ADD COLUMN background_word TEXT NOT NULL DEFAULT 'LOVE';