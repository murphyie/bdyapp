-- Add landing_page_word column for customizable 3D text on landing page
ALTER TABLE public.settings ADD COLUMN landing_page_word text NOT NULL DEFAULT 'ZUHA';

-- Update theme_type to allow for a third option: brotherly-simple
-- This is just a text field so no migration needed, we just need to handle the new value in code