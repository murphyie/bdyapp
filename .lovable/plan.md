

## Plan: Create Supabase Configuration File

### Overview
I'll create a configuration file where you can easily add your Supabase credentials, and update the Supabase client to read from it. This way you can manage credentials directly in the repo.

### What You'll Need
Before we start, you'll need these from your Supabase project dashboard:
1. **Project URL** - Found in Settings > API (looks like `https://xxxxx.supabase.co`)
2. **Anon/Public Key** - Found in Settings > API (the "anon" key, safe for client-side use)

### Changes to Make

**1. Create `src/config/supabase.config.ts`**
A new config file where you'll paste your credentials:
```text
supabaseUrl: "YOUR_SUPABASE_URL_HERE"
supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY_HERE"
```

**2. Update `src/integrations/supabase/client.ts`**
Modify to read from the config file instead of environment variables, with fallback support for both methods.

### Technical Details

The updated client will:
- First check the config file for credentials
- Fall back to environment variables if config is empty
- Show a helpful console warning if neither is configured

This approach:
- Works without Lovable Cloud
- Keeps credentials in one easy-to-find place
- Still supports environment variables as a fallback
- Is simple to update when deploying elsewhere

### Important Note
The anon key is a **public/publishable key** - it's safe to commit to your repo as it only allows operations permitted by your Row Level Security (RLS) policies.

