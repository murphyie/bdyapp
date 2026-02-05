import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramMessageRequest {
  message: string;
  senderName?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, senderName }: TelegramMessageRequest = await req.json();

    if (!message || message.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get Supabase client to fetch settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Telegram settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("telegram_bot_token, telegram_chat_id, birthday_name")
      .single();

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch settings" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { telegram_bot_token, telegram_chat_id, birthday_name } = settings;

    if (!telegram_bot_token || !telegram_chat_id) {
      console.log("Telegram not configured - bot token or chat ID missing");
      return new Response(
        JSON.stringify({ error: "Telegram is not configured. Please set up bot token and chat ID in admin panel." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format the message
    const formattedMessage = `💌 *New Message from Birthday Site*\n\n` +
      `👤 *From:* ${senderName || birthday_name || "Birthday Girl"}\n\n` +
      `📝 *Message:*\n${message}\n\n` +
      `⏰ *Sent at:* ${new Date().toLocaleString()}`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${telegram_bot_token}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegram_chat_id,
        text: formattedMessage,
        parse_mode: "Markdown",
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error("Telegram API error:", telegramResult);
      return new Response(
        JSON.stringify({ error: "Failed to send message to Telegram", details: telegramResult }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Message sent to Telegram successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-telegram function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
