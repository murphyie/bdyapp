import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Settings {
  id: string;
  birthday_name: string;
  birthday_date: string;
  hero_message: string;
  primary_color: string;
  testing_mode: boolean;
  show_scroll_animations: boolean;
  show_audio_visualizer: boolean;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  background_word: string;
  show_floating_image: boolean;
  floating_image_url: string | null;
  theme_type: 'sisterly' | 'brotherly' | 'brotherly-simple';
  landing_page_word: string;
  show_photos: boolean;
}

export interface Photo {
  id: string;
  url: string;
  caption: string | null;
  year: number | null;
  display_order: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  audio_url: string | null;
  embed_url: string | null;
  display_order: number;
}

export interface Message {
  id: string;
  content: string;
  message_type: string;
  author_name: string | null;
  display_order: number;
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data as Settings | null;
    },
  });
}

export function usePhotos() {
  return useQuery({
    queryKey: ['photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Photo[];
    },
  });
}

export function useSongs() {
  return useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Song[];
    },
  });
}

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
  });
}

export function useMainMessage() {
  return useQuery({
    queryKey: ['main-message'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('message_type', 'main')
        .maybeSingle();
      
      if (error) throw error;
      return data as Message | null;
    },
  });
}

export function useWishes() {
  return useQuery({
    queryKey: ['wishes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('message_type', 'wish')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
  });
}
