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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      groups: {
        Row: {
          created_at: string
          current_round: number
          id: string
          name: string
          player_ids: Json
          status: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          current_round?: number
          id?: string
          name: string
          player_ids?: Json
          status?: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          current_round?: number
          id?: string
          name?: string
          player_ids?: Json
          status?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      knockout_matches: {
        Row: {
          created_at: string
          id: string
          match_number: number
          player1_id: string | null
          player2_id: string | null
          result: string | null
          stage: string
          status: string
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_number: number
          player1_id?: string | null
          player2_id?: string | null
          result?: string | null
          stage: string
          status?: string
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_number?: number
          player1_id?: string | null
          player2_id?: string | null
          result?: string | null
          stage?: string
          status?: string
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knockout_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          buchholz: number
          checked_in: boolean
          color_history: Json
          created_at: string
          draws: number
          group_id: string | null
          id: string
          losses: number
          name: string
          opponent_history: Json
          organization: string | null
          phone: string | null
          player_code: string
          points: number
          rating: number | null
          sonneborn_berger: number
          status: string
          tournament_id: string
          wins: number
        }
        Insert: {
          buchholz?: number
          checked_in?: boolean
          color_history?: Json
          created_at?: string
          draws?: number
          group_id?: string | null
          id?: string
          losses?: number
          name: string
          opponent_history?: Json
          organization?: string | null
          phone?: string | null
          player_code: string
          points?: number
          rating?: number | null
          sonneborn_berger?: number
          status?: string
          tournament_id: string
          wins?: number
        }
        Update: {
          buchholz?: number
          checked_in?: boolean
          color_history?: Json
          created_at?: string
          draws?: number
          group_id?: string | null
          id?: string
          losses?: number
          name?: string
          opponent_history?: Json
          organization?: string | null
          phone?: string | null
          player_code?: string
          points?: number
          rating?: number | null
          sonneborn_berger?: number
          status?: string
          tournament_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          bye_player_id: string | null
          created_at: string
          group_id: string | null
          id: string
          matches: Json
          round_number: number
          stage: string
          status: string
          tournament_id: string
        }
        Insert: {
          bye_player_id?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          matches?: Json
          round_number: number
          stage?: string
          status?: string
          tournament_id: string
        }
        Update: {
          bye_player_id?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          matches?: Json
          round_number?: number
          stage?: string
          status?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          announcements: Json
          boards: number
          created_at: string
          current_round: number
          finals_rounds: number
          group_size: number
          id: string
          knockout_round: number
          mode: string
          name: string
          phase: string
          qualifiers_per_group: number
          status: string
          swiss_threshold: number
          time_control: string
          total_rounds: number
          updated_at: string
        }
        Insert: {
          announcements?: Json
          boards?: number
          created_at?: string
          current_round?: number
          finals_rounds?: number
          group_size?: number
          id?: string
          knockout_round?: number
          mode?: string
          name?: string
          phase?: string
          qualifiers_per_group?: number
          status?: string
          swiss_threshold?: number
          time_control?: string
          total_rounds?: number
          updated_at?: string
        }
        Update: {
          announcements?: Json
          boards?: number
          created_at?: string
          current_round?: number
          finals_rounds?: number
          group_size?: number
          id?: string
          knockout_round?: number
          mode?: string
          name?: string
          phase?: string
          qualifiers_per_group?: number
          status?: string
          swiss_threshold?: number
          time_control?: string
          total_rounds?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
