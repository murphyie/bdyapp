-- Add show_photos column to settings table
ALTER TABLE public.settings
ADD COLUMN show_photos BOOLEAN NOT NULL DEFAULT true;