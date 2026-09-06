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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assessment_responses: {
        Row: {
          answers: Json
          assessment_id: string
          created_at: string
          id: string
          meta: Json
        }
        Insert: {
          answers?: Json
          assessment_id: string
          created_at?: string
          id?: string
          meta?: Json
        }
        Update: {
          answers?: Json
          assessment_id?: string
          created_at?: string
          id?: string
          meta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_results: {
        Row: {
          assessment_id: string
          combination: string | null
          computed_at: string
          id: string
          predominant: string | null
          scores: Json
          scoring_version: string | null
        }
        Insert: {
          assessment_id: string
          combination?: string | null
          computed_at?: string
          id?: string
          predominant?: string | null
          scores?: Json
          scoring_version?: string | null
        }
        Update: {
          assessment_id?: string
          combination?: string | null
          computed_at?: string
          id?: string
          predominant?: string | null
          scores?: Json
          scoring_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          candidate_email: string
          candidate_name: string
          candidate_whatsapp: string | null
          coach_id: string
          consent_accepted_at: string | null
          context: string | null
          created_at: string
          id: string
          instrument_id: string | null
          instrument_version: string | null
          organization_id: string | null
          role_title: string | null
          started_at: string | null
          status: string
          submitted_at: string | null
          token: string
        }
        Insert: {
          candidate_email: string
          candidate_name: string
          candidate_whatsapp?: string | null
          coach_id: string
          consent_accepted_at?: string | null
          context?: string | null
          created_at?: string
          id?: string
          instrument_id?: string | null
          instrument_version?: string | null
          organization_id?: string | null
          role_title?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          token: string
        }
        Update: {
          candidate_email?: string
          candidate_name?: string
          candidate_whatsapp?: string | null
          coach_id?: string
          consent_accepted_at?: string | null
          context?: string | null
          created_at?: string
          id?: string
          instrument_id?: string | null
          instrument_version?: string | null
          organization_id?: string | null
          role_title?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      diag_application_answers: {
        Row: {
          answered_at: string
          application_id: string
          id: string
          is_na: boolean
          question_code: string
          question_id: string
          value: number | null
        }
        Insert: {
          answered_at?: string
          application_id: string
          id?: string
          is_na?: boolean
          question_code: string
          question_id: string
          value?: number | null
        }
        Update: {
          answered_at?: string
          application_id?: string
          id?: string
          is_na?: boolean
          question_code?: string
          question_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diag_application_answers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "diag_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diag_application_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "diag_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      diag_applications: {
        Row: {
          analyst_id: string
          consent_accepted_at: string | null
          context: string | null
          created_at: string
          id: string
          instrument_id: string
          instrument_version: string | null
          organization_id: string | null
          participant_id: string | null
          released_at: string | null
          released_by: string | null
          started_at: string | null
          status: string
          submitted_at: string | null
          token: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          analyst_id: string
          consent_accepted_at?: string | null
          context?: string | null
          created_at?: string
          id?: string
          instrument_id: string
          instrument_version?: string | null
          organization_id?: string | null
          participant_id?: string | null
          released_at?: string | null
          released_by?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          token: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          analyst_id?: string
          consent_accepted_at?: string | null
          context?: string | null
          created_at?: string
          id?: string
          instrument_id?: string
          instrument_version?: string | null
          organization_id?: string | null
          participant_id?: string | null
          released_at?: string | null
          released_by?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          token?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diag_applications_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "diag_instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diag_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diag_applications_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      diag_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          application_id: string | null
          created_at: string
          details: Json
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          application_id?: string | null
          created_at?: string
          details?: Json
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          application_id?: string | null
          created_at?: string
          details?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diag_audit_log_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "diag_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      diag_dimensions: {
        Row: {
          axis_weights: Json
          code: string
          created_at: string
          description: string | null
          id: string
          instrument_id: string
          name: string
          sort_order: number
        }
        Insert: {
          axis_weights?: Json
          code: string
          created_at?: string
          description?: string | null
          id?: string
          instrument_id: string
          name: string
          sort_order?: number
        }
        Update: {
          axis_weights?: Json
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          instrument_id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "diag_dimensions_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "diag_instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      diag_instruments: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          engine_config: Json
          id: string
          name: string
          scale: Json
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          engine_config?: Json
          id?: string
          name: string
          scale?: Json
          status?: string
          updated_at?: string
          version?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          engine_config?: Json
          id?: string
          name?: string
          scale?: Json
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      diag_patterns: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          id: string
          instrument_id: string
          kind: string
          name: string
          rule: Json
          severity: string
          sort_order: number
          stage_affinity: Json
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          id?: string
          instrument_id: string
          kind?: string
          name: string
          rule?: Json
          severity?: string
          sort_order?: number
          stage_affinity?: Json
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          instrument_id?: string
          kind?: string
          name?: string
          rule?: Json
          severity?: string
          sort_order?: number
          stage_affinity?: Json
        }
        Relationships: [
          {
            foreignKeyName: "diag_patterns_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "diag_instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      diag_pre_diagnostics: {
        Row: {
          affinities: Json
          alerts: Json
          application_id: string
          auto_release_blocked: boolean
          axes: Json
          computed_at: string
          confidence: number | null
          confidence_level: string | null
          dimension_scores: Json
          engine_version: string
          id: string
          in_transition: boolean
          indicators: Json
          patterns: Json
          predominant_stage: string | null
          requires_validation: boolean
          secondary_stage: string | null
          snapshot: Json
        }
        Insert: {
          affinities?: Json
          alerts?: Json
          application_id: string
          auto_release_blocked?: boolean
          axes?: Json
          computed_at?: string
          confidence?: number | null
          confidence_level?: string | null
          dimension_scores?: Json
          engine_version?: string
          id?: string
          in_transition?: boolean
          indicators?: Json
          patterns?: Json
          predominant_stage?: string | null
          requires_validation?: boolean
          secondary_stage?: string | null
          snapshot?: Json
        }
        Update: {
          affinities?: Json
          alerts?: Json
          application_id?: string
          auto_release_blocked?: boolean
          axes?: Json
          computed_at?: string
          confidence?: number | null
          confidence_level?: string | null
          dimension_scores?: Json
          engine_version?: string
          id?: string
          in_transition?: boolean
          indicators?: Json
          patterns?: Json
          predominant_stage?: string | null
          requires_validation?: boolean
          secondary_stage?: string | null
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "diag_pre_diagnostics_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "diag_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      diag_questions: {
        Row: {
          active: boolean
          allow_na: boolean
          code: string
          created_at: string
          dimension_id: string
          direction: string
          id: string
          instrument_id: string
          sort_order: number
          text: string
          updated_at: string
          weight: number
        }
        Insert: {
          active?: boolean
          allow_na?: boolean
          code: string
          created_at?: string
          dimension_id: string
          direction?: string
          id?: string
          instrument_id: string
          sort_order?: number
          text: string
          updated_at?: string
          weight?: number
        }
        Update: {
          active?: boolean
          allow_na?: boolean
          code?: string
          created_at?: string
          dimension_id?: string
          direction?: string
          id?: string
          instrument_id?: string
          sort_order?: number
          text?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "diag_questions_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "diag_dimensions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diag_questions_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "diag_instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      diag_reports: {
        Row: {
          adjusted_stage_code: string | null
          analyst_notes: string | null
          application_id: string
          content: Json
          created_at: string
          id: string
          released_at: string | null
          released_by: string | null
          status: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          adjusted_stage_code?: string | null
          analyst_notes?: string | null
          application_id: string
          content?: Json
          created_at?: string
          id?: string
          released_at?: string | null
          released_by?: string | null
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          adjusted_stage_code?: string | null
          analyst_notes?: string | null
          application_id?: string
          content?: Json
          created_at?: string
          id?: string
          released_at?: string | null
          released_by?: string | null
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diag_reports_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "diag_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      diag_stage_profiles: {
        Row: {
          auto_release_allowed: boolean
          axes: Json
          code: string
          created_at: string
          description: string | null
          id: string
          instrument_id: string
          is_critical: boolean
          name: string
          narrative: Json
          short_label: string | null
          sort_order: number
        }
        Insert: {
          auto_release_allowed?: boolean
          axes?: Json
          code: string
          created_at?: string
          description?: string | null
          id?: string
          instrument_id: string
          is_critical?: boolean
          name: string
          narrative?: Json
          short_label?: string | null
          sort_order?: number
        }
        Update: {
          auto_release_allowed?: boolean
          axes?: Json
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          instrument_id?: string
          is_critical?: boolean
          name?: string
          narrative?: Json
          short_label?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "diag_stage_profiles_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "diag_instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      instruments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          items: Json
          name: string
          scoring: Json
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          items?: Json
          name: string
          scoring?: Json
          status?: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          items?: Json
          name?: string
          scoring?: Json
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          coach_id: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
        }
        Insert: {
          coach_id: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
        }
        Update: {
          coach_id?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          analyst_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          organization_id: string | null
          role_title: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          analyst_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          role_title?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          analyst_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          role_title?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
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
      app_role: "admin" | "coach"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "coach"],
    },
  },
} as const
