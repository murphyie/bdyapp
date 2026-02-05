-- Add columns for floating image settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS show_floating_image boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS floating_image_url text DEFAULT NULL;