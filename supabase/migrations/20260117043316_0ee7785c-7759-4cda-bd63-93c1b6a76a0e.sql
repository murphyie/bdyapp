-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles (only admins can view)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create settings table for birthday app configuration
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  birthday_name TEXT NOT NULL DEFAULT 'Someone Special',
  birthday_date DATE NOT NULL DEFAULT '2026-01-18',
  hero_message TEXT NOT NULL DEFAULT 'A magical celebration awaits you',
  primary_color TEXT NOT NULL DEFAULT '#FF69B4',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings"
  ON public.settings FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create photos table
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT,
  year INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Anyone can read photos
CREATE POLICY "Anyone can read photos"
  ON public.photos FOR SELECT
  USING (true);

-- Only admins can manage photos
CREATE POLICY "Admins can insert photos"
  ON public.photos FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update photos"
  ON public.photos FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete photos"
  ON public.photos FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create songs table
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  audio_url TEXT,
  embed_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Anyone can read songs
CREATE POLICY "Anyone can read songs"
  ON public.songs FOR SELECT
  USING (true);

-- Only admins can manage songs
CREATE POLICY "Admins can insert songs"
  ON public.songs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update songs"
  ON public.songs FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete songs"
  ON public.songs FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'wish', -- 'main' or 'wish'
  author_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages
CREATE POLICY "Anyone can read messages"
  ON public.messages FOR SELECT
  USING (true);

-- Only admins can manage messages
CREATE POLICY "Admins can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update messages"
  ON public.messages FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (birthday_name, birthday_date, hero_message, primary_color)
VALUES ('Someone Special', '2026-01-18', 'A magical celebration awaits you ✨', '#FF69B4');

-- Insert placeholder photos
INSERT INTO public.photos (url, caption, year, display_order) VALUES
  ('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', 'Magical moments together 🎉', 2024, 1),
  ('https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600', 'Celebrating with joy ✨', 2024, 2),
  ('https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600', 'Fun times and laughter 🎈', 2023, 3),
  ('https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600', 'Sweet memories 🍰', 2023, 4),
  ('https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600', 'Dancing through life 💃', 2022, 5),
  ('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600', 'Party vibes 🎊', 2022, 6),
  ('https://images.unsplash.com/photo-1496843916299-590492c751f4?w=600', 'Adventures await 🌟', 2021, 7),
  ('https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=600', 'Golden moments 🌅', 2021, 8);

-- Insert placeholder songs
INSERT INTO public.songs (title, artist, cover_url, display_order) VALUES
  ('Happy Birthday', 'Birthday Classics', '🎂', 1),
  ('Celebration', 'Kool & The Gang', '🎉', 2),
  ('Birthday', 'The Beatles', '🎈', 3),
  ('Good Times', 'Chic', '✨', 4),
  ('Dancing Queen', 'ABBA', '👑', 5),
  ('Uptown Funk', 'Bruno Mars', '🕺', 6),
  ('Happy', 'Pharrell Williams', '😊', 7),
  ('Best Day of My Life', 'American Authors', '🌟', 8);

-- Insert placeholder messages
INSERT INTO public.messages (content, message_type, author_name, display_order) VALUES
  ('On this special day, I want to take a moment to celebrate the incredible person you are. Your smile lights up every room, your kindness touches every heart, and your spirit inspires everyone around you.

Through every season of life, you''ve shown remarkable strength, grace, and an unwavering ability to find joy in the smallest moments. You make the world a brighter place simply by being in it.

Here''s to another year of adventures, laughter, and beautiful memories. May this birthday be the beginning of your best chapter yet, filled with love, success, and all the happiness your heart can hold.

You deserve all the magic this world has to offer. Happy Birthday! 🎂✨', 'main', NULL, 1),
  ('Wishing you endless joy and all the cake you can eat! 🎂', 'wish', 'Best Friend', 2),
  ('May your special day be filled with love and laughter! 🎈', 'wish', 'Family', 3),
  ('Here''s to celebrating the amazing person you are! 🌟', 'wish', 'Colleague', 4),
  ('Another year of being awesome! Keep shining! ✨', 'wish', 'Old Friend', 5);

-- Create storage bucket for birthday media
INSERT INTO storage.buckets (id, name, public) VALUES ('birthday-media', 'birthday-media', true);

-- Storage policies for birthday media
CREATE POLICY "Anyone can view birthday media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'birthday-media');

CREATE POLICY "Admins can upload birthday media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'birthday-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update birthday media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'birthday-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete birthday media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'birthday-media' AND public.has_role(auth.uid(), 'admin'));