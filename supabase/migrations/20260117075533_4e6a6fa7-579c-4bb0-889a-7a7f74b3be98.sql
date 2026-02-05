-- Add Telegram bot settings to the settings table
ALTER TABLE public.settings
ADD COLUMN telegram_bot_token text,
ADD COLUMN telegram_chat_id text;