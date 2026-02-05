-- Add testing_mode column to settings table for admin testing
ALTER TABLE public.settings 
ADD COLUMN testing_mode boolean NOT NULL DEFAULT false;