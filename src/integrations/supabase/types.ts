export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      messages: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          display_order: number
          id: string
          message_type: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          display_order?: number
          id?: string
          message_type?: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          display_order?: number
          id?: string
          message_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          updated_at: string
          url: string
          year: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          updated_at?: string
          url: string
          year?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          updated_at?: string
          url?: string
          year?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          background_word: string
          birthday_date: string
          birthday_name: string
          created_at: string
          floating_image_url: string | null
          hero_message: string
          id: string
          landing_page_word: string
          primary_color: string
          show_audio_visualizer: boolean
          show_floating_image: boolean
          show_photos: boolean
          show_scroll_animations: boolean
          telegram_bot_token: string | null
          telegram_chat_id: string | null
          testing_mode: boolean
          theme_type: string
          updated_at: string
        }
        Insert: {
          background_word?: string
          birthday_date?: string
          birthday_name?: string
          created_at?: string
          floating_image_url?: string | null
          hero_message?: string
          id?: string
          landing_page_word?: string
          primary_color?: string
          show_audio_visualizer?: boolean
          show_floating_image?: boolean
          show_photos?: boolean
          show_scroll_animations?: boolean
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          testing_mode?: boolean
          theme_type?: string
          updated_at?: string
        }
        Update: {
          background_word?: string
          birthday_date?: string
          birthday_name?: string
          created_at?: string
          floating_image_url?: string | null
          hero_message?: string
          id?: string
          landing_page_word?: string
          primary_color?: string
          show_audio_visualizer?: boolean
          show_floating_image?: boolean
          show_photos?: boolean
          show_scroll_animations?: boolean
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          testing_mode?: boolean
          theme_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          artist: string
          audio_url: string | null
          cover_url: string | null
          created_at: string
          display_order: number
          embed_url: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          artist: string
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          display_order?: number
          embed_url?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          artist?: string
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          display_order?: number
          embed_url?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
