-- Add theme_type column to settings table
ALTER TABLE public.settings 
ADD COLUMN theme_type text NOT NULL DEFAULT 'brotherly';

-- Add comment for documentation
COMMENT ON COLUMN public.settings.theme_type IS 'Theme type: brotherly (gaming) or sisterly (magical)';