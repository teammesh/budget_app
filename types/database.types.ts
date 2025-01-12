export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: number
          profile_id: string | null
          table_item_id: string | null
          table_name: string | null
          to_profile_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: number
          profile_id?: string | null
          table_item_id?: string | null
          table_name?: string | null
          to_profile_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: number
          profile_id?: string | null
          table_item_id?: string | null
          table_name?: string | null
          to_profile_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_to_profile_id_fkey"
            columns: ["to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      balances: {
        Row: {
          amount: number | null
          created_at: string | null
          from_profile_id: string | null
          group_id: string | null
          id: number
          to_profile_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          from_profile_id?: string | null
          group_id?: string | null
          id?: number
          to_profile_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          from_profile_id?: string | null
          group_id?: string | null
          id?: number
          to_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "balances_from_profile_id_fkey"
            columns: ["from_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balances_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balances_to_profile_id_fkey"
            columns: ["to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          created_at: string | null
          created_by: string
          edited_at: string | null
          id: number
          message: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          edited_at?: string | null
          id?: number
          message?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          edited_at?: string | null
          id?: number
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_deleted: boolean
          name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean
          name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean
          name?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string | null
          from_profile_id: string
          group_id: string | null
          id: number
          to_profile_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          from_profile_id: string
          group_id?: string | null
          id?: number
          to_profile_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          from_profile_id?: string
          group_id?: string | null
          id?: number
          to_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_from_profile_id_fkey"
            columns: ["from_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_to_profile_id_fkey"
            columns: ["to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plaid_items: {
        Row: {
          access_token: string
          account_id: string
          created_at: string | null
          id: number
          institution_name: string | null
          item_id: string
          last_four_digits: number | null
          profile_id: string
        }
        Insert: {
          access_token: string
          account_id: string
          created_at?: string | null
          id?: number
          institution_name?: string | null
          item_id: string
          last_four_digits?: number | null
          profile_id: string
        }
        Update: {
          access_token?: string
          account_id?: string
          created_at?: string | null
          id?: number
          institution_name?: string | null
          item_id?: string
          last_four_digits?: number | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plaid_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      profiles_groups: {
        Row: {
          amount_owed: number
          amount_paid_transactions: number
          amount_paid_users: number
          amount_received_users: number
          created_at: string | null
          group_id: string | null
          id: number
          profile_id: string | null
          split_amount: number
        }
        Insert: {
          amount_owed?: number
          amount_paid_transactions?: number
          amount_paid_users?: number
          amount_received_users?: number
          created_at?: string | null
          group_id?: string | null
          id?: number
          profile_id?: string | null
          split_amount?: number
        }
        Update: {
          amount_owed?: number
          amount_paid_transactions?: number
          amount_paid_users?: number
          amount_received_users?: number
          created_at?: string | null
          group_id?: string | null
          id?: number
          profile_id?: string | null
          split_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_groups_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_transactions: {
        Row: {
          account_id: string
          amount: number
          authorized_date: string | null
          category: string[] | null
          category_id: string | null
          charged_to: string
          created_at: string
          date: string | null
          description: string | null
          group_id: string
          id: string
          is_deleted: boolean
          location: Json | null
          merchant_name: string | null
          name: string | null
          notes: string | null
          payment_channel: string | null
          payment_meta: Json | null
          pending: boolean | null
          split_amounts: Json | null
          transaction_id: string | null
          transaction_type: string | null
        }
        Insert: {
          account_id: string
          amount: number
          authorized_date?: string | null
          category?: string[] | null
          category_id?: string | null
          charged_to: string
          created_at?: string
          date?: string | null
          description?: string | null
          group_id: string
          id?: string
          is_deleted?: boolean
          location?: Json | null
          merchant_name?: string | null
          name?: string | null
          notes?: string | null
          payment_channel?: string | null
          payment_meta?: Json | null
          pending?: boolean | null
          split_amounts?: Json | null
          transaction_id?: string | null
          transaction_type?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          authorized_date?: string | null
          category?: string[] | null
          category_id?: string | null
          charged_to?: string
          created_at?: string
          date?: string | null
          description?: string | null
          group_id?: string
          id?: string
          is_deleted?: boolean
          location?: Json | null
          merchant_name?: string | null
          name?: string | null
          notes?: string | null
          payment_channel?: string | null
          payment_meta?: Json | null
          pending?: boolean | null
          split_amounts?: Json | null
          transaction_id?: string | null
          transaction_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_transactions_charged_to_fkey"
            columns: ["charged_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_transactions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      teller_accounts: {
        Row: {
          account_id: string
          account_name: string | null
          account_subtype: string | null
          account_type: string | null
          created_at: string | null
          enrollment_id: string
          id: number
          last_four: string | null
          profile_id: string
        }
        Insert: {
          account_id: string
          account_name?: string | null
          account_subtype?: string | null
          account_type?: string | null
          created_at?: string | null
          enrollment_id: string
          id?: number
          last_four?: string | null
          profile_id: string
        }
        Update: {
          account_id?: string
          account_name?: string | null
          account_subtype?: string | null
          account_type?: string | null
          created_at?: string | null
          enrollment_id?: string
          id?: number
          last_four?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teller_accounts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "teller_auth"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "teller_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teller_auth: {
        Row: {
          access_token: string
          created_at: string | null
          enrollment_id: string
          id: number
          institution_name: string | null
          profile_id: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          enrollment_id: string
          id?: number
          institution_name?: string | null
          profile_id: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          enrollment_id?: string
          id?: number
          institution_name?: string | null
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teller_auth_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_amounts: {
        Args: {
          g_id: string
        }
        Returns: {
          amount: number | null
          created_at: string | null
          from_profile_id: string | null
          group_id: string | null
          id: number
          to_profile_id: string | null
        }[]
      }
      calculate_balances: {
        Args: {
          g_id: string
        }
        Returns: undefined
      }
      get_user_amount: {
        Args: {
          g_id: string
          p_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
