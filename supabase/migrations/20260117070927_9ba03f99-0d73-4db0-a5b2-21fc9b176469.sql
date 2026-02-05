-- Add visual effect toggles to settings table
ALTER TABLE public.settings 
ADD COLUMN show_scroll_animations BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN show_audio_visualizer BOOLEAN NOT NULL DEFAULT true;