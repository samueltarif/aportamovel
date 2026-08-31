export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_action_leases: {
        Row: {
          action_key: string
          actor_user_id: string
          created_at: string
          idempotency_key: string
          lease_token: string
          processing_expires_at: string
          result_expires_at: string
          status: string
          updated_at: string
        }
        Insert: {
          action_key: string
          actor_user_id: string
          created_at?: string
          idempotency_key: string
          lease_token?: string
          processing_expires_at: string
          result_expires_at: string
          status: string
          updated_at?: string
        }
        Update: {
          action_key?: string
          actor_user_id?: string
          created_at?: string
          idempotency_key?: string
          lease_token?: string
          processing_expires_at?: string
          result_expires_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_idempotency_keys: {
        Row: {
          actor_user_id: string
          created_at: string
          execution_token: string
          idempotency_key: string
          operation: string
          processing_expires_at: string
          request_hash: string
          response: Json | null
          result_expires_at: string
          status: string
          updated_at: string
        }
        Insert: {
          actor_user_id: string
          created_at?: string
          execution_token?: string
          idempotency_key: string
          operation: string
          processing_expires_at: string
          request_hash: string
          response?: Json | null
          result_expires_at: string
          status: string
          updated_at?: string
        }
        Update: {
          actor_user_id?: string
          created_at?: string
          execution_token?: string
          idempotency_key?: string
          operation?: string
          processing_expires_at?: string
          request_hash?: string
          response?: Json | null
          result_expires_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_invite_reservations: {
        Row: {
          actor_user_id: string
          auth_user_id: string | null
          compensation_token: string | null
          created_at: string
          idempotency_key: string
          lease_token: string
          normalized_email: string
          processing_expires_at: string
          result_expires_at: string
          status: string
        }
        Insert: {
          actor_user_id: string
          auth_user_id?: string | null
          compensation_token?: string | null
          created_at?: string
          idempotency_key: string
          lease_token?: string
          normalized_email: string
          processing_expires_at: string
          result_expires_at: string
          status: string
        }
        Update: {
          actor_user_id?: string
          auth_user_id?: string | null
          compensation_token?: string | null
          created_at?: string
          idempotency_key?: string
          lease_token?: string
          normalized_email?: string
          processing_expires_at?: string
          result_expires_at?: string
          status?: string
        }
        Relationships: []
      }
      admin_rate_limits: {
        Row: {
          attempts: number
          key: string
          window_start: string
        }
        Insert: {
          attempts?: number
          key: string
          window_start?: string
        }
        Update: {
          attempts?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      admin_user_audit: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          id: string
          new_is_active: boolean | null
          new_role: string | null
          old_is_active: boolean | null
          old_role: string | null
          target_user_id: string
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          id?: string
          new_is_active?: boolean | null
          new_role?: string | null
          old_is_active?: boolean | null
          old_role?: string | null
          target_user_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          id?: string
          new_is_active?: boolean | null
          new_role?: string | null
          old_is_active?: boolean | null
          old_role?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          accepted_at: string | null
          created_at: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          is_active?: boolean
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          media_id: string
          sort_order: number
          title_override: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          media_id: string
          sort_order?: number
          title_override?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          media_id?: string
          sort_order?: number
          title_override?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_slides_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: true
            referencedRelation: "service_media"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          author_id: string
          created_at: string
          id: string
          lead_id: string
          note: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          lead_id: string
          note: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          lead_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_status_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          lead_id: string
          new_status: string
          old_status: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          lead_id: string
          new_status: string
          old_status: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          lead_id?: string
          new_status?: string
          old_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          archived_at: string | null
          company_or_condominium: string | null
          consent_at: string
          contacted_at: string | null
          created_at: string
          email: string | null
          form_id: string
          full_name: string
          id: string
          idempotency_key: string
          last_updated_by: string | null
          message: string | null
          phone: string
          privacy_notice_version: string
          service_name: string | null
          service_slug: string | null
          source_path: string
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          archived_at?: string | null
          company_or_condominium?: string | null
          consent_at: string
          contacted_at?: string | null
          created_at?: string
          email?: string | null
          form_id: string
          full_name: string
          id?: string
          idempotency_key: string
          last_updated_by?: string | null
          message?: string | null
          phone: string
          privacy_notice_version: string
          service_name?: string | null
          service_slug?: string | null
          source_path: string
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          archived_at?: string | null
          company_or_condominium?: string | null
          consent_at?: string
          contacted_at?: string | null
          created_at?: string
          email?: string | null
          form_id?: string
          full_name?: string
          id?: string
          idempotency_key?: string
          last_updated_by?: string | null
          message?: string | null
          phone?: string
          privacy_notice_version?: string
          service_name?: string | null
          service_slug?: string | null
          source_path?: string
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      r2_orphan_cleanup_queue: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          max_attempts: number
          next_attempt_at: string
          reason: string
          storage_key: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          reason: string
          storage_key: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          reason?: string
          storage_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_media: {
        Row: {
          alt_text: string
          caption: string | null
          created_at: string
          duration_seconds: number | null
          height: number | null
          id: string
          is_cover: boolean
          media_stage: string
          media_type: string
          mime_type: string
          publication_id: string
          size_bytes: number
          sort_order: number
          storage_key: string
          thumbnail_storage_key: string | null
          width: number | null
        }
        Insert: {
          alt_text: string
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          height?: number | null
          id?: string
          is_cover?: boolean
          media_stage?: string
          media_type: string
          mime_type: string
          publication_id: string
          size_bytes: number
          sort_order?: number
          storage_key: string
          thumbnail_storage_key?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          height?: number | null
          id?: string
          is_cover?: boolean
          media_stage?: string
          media_type?: string
          mime_type?: string
          publication_id?: string
          size_bytes?: number
          sort_order?: number
          storage_key?: string
          thumbnail_storage_key?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_media_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "service_publications"
            referencedColumns: ["id"]
          },
        ]
      }
      service_publications: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          id: string
          published_at: string | null
          service_id: string
          slug: string
          status: string
          summary: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          id?: string
          published_at?: string | null
          service_id: string
          slug: string
          status?: string
          summary: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          id?: string
          published_at?: string | null
          service_id?: string
          slug?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_publications_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          accent_variant: string
          archived_at: string | null
          card_image_alt: string | null
          card_image_storage_key: string | null
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          home_display_order: number
          icon_key: string
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          short_description: string
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accent_variant?: string
          archived_at?: string | null
          card_image_alt?: string | null
          card_image_storage_key?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          home_display_order?: number
          icon_key: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          short_description: string
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accent_variant?: string
          archived_at?: string | null
          card_image_alt?: string | null
          card_image_storage_key?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          home_display_order?: number
          icon_key?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          short_description?: string
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      upload_intents: {
        Row: {
          created_at: string
          expected_mime_type: string
          expected_size_bytes: number
          expires_at: string
          id: string
          max_size_bytes: number
          status: string
          storage_key: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expected_mime_type: string
          expected_size_bytes: number
          expires_at: string
          id?: string
          max_size_bytes: number
          status?: string
          storage_key: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expected_mime_type?: string
          expected_size_bytes?: number
          expires_at?: string
          id?: string
          max_size_bytes?: number
          status?: string
          storage_key?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_admin_invite_atomic: { Args: { p_user_id: string }; Returns: Json }
      acquire_admin_action_lease: {
        Args: {
          p_action_key: string
          p_actor_user_id: string
          p_idempotency_key: string
          p_processing_ttl_secs: number
          p_result_ttl_secs: number
        }
        Returns: Json
      }
      acquire_admin_invite_reservation: {
        Args: {
          p_actor_user_id: string
          p_idempotency_key: string
          p_normalized_email: string
          p_processing_ttl_secs: number
          p_result_ttl_secs: number
        }
        Returns: Json
      }
      acquire_idempotency_key: {
        Args: {
          p_actor_user_id: string
          p_key: string
          p_operation: string
          p_processing_ttl_secs: number
          p_request_hash: string
          p_result_ttl_secs: number
        }
        Returns: Json
      }
      activate_service_atomic: {
        Args: { p_service_id: string; p_user_id: string }
        Returns: {
          accent_variant: string
          archived_at: string | null
          card_image_alt: string | null
          card_image_storage_key: string | null
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          home_display_order: number
          icon_key: string
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          short_description: string
          slug: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "services"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      audit_admin_invite_resent_atomic: {
        Args: { p_actor_user_id: string; p_target_user_id: string }
        Returns: Json
      }
      bind_admin_invite_auth_user: {
        Args: {
          p_actor_user_id: string
          p_auth_user_id: string
          p_idempotency_key: string
          p_lease_token: string
          p_normalized_email: string
        }
        Returns: boolean
      }
      check_and_increment_rate_limit: {
        Args: { p_key: string; p_max_attempts: number; p_window_secs: number }
        Returns: boolean
      }
      claim_admin_invite_compensation: {
        Args: {
          p_actor_user_id: string
          p_auth_user_id: string
          p_idempotency_key: string
          p_lease_token: string
          p_normalized_email: string
        }
        Returns: Json
      }
      claim_stale_admin_invite_compensation_recovery: {
        Args: { p_normalized_email: string }
        Returns: Json
      }
      commit_pending_admin_invite_atomic: {
        Args: {
          p_actor_user_id: string
          p_auth_user_id: string
          p_idempotency_key: string
          p_lease_token: string
          p_normalized_email: string
          p_role: string
        }
        Returns: Json
      }
      delete_media_atomic: {
        Args: { p_media_id: string; p_user_id: string }
        Returns: string
      }
      finalize_admin_invite_compensation: {
        Args: {
          p_auth_user_id: string
          p_compensation_token: string
          p_normalized_email: string
        }
        Returns: boolean
      }
      finalize_media_upload_atomic: {
        Args: {
          p_actual_size_bytes: number
          p_alt_text: string
          p_caption: string
          p_duration_seconds: number
          p_height: number
          p_intent_id: string
          p_is_cover: boolean
          p_media_stage: string
          p_user_id: string
          p_width: number
        }
        Returns: {
          alt_text: string
          caption: string | null
          created_at: string
          duration_seconds: number | null
          height: number | null
          id: string
          is_cover: boolean
          media_stage: string
          media_type: string
          mime_type: string
          publication_id: string
          size_bytes: number
          sort_order: number
          storage_key: string
          thumbnail_storage_key: string | null
          width: number | null
        }
        SetofOptions: {
          from: "*"
          to: "service_media"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finalize_service_card_image_atomic: {
        Args: {
          p_actual_size_bytes: number
          p_alt_text: string
          p_intent_id: string
          p_user_id: string
        }
        Returns: {
          old_storage_key: string
          service_row: Database["public"]["Tables"]["services"]["Row"]
        }[]
      }
      get_admin_user_by_email_atomic: {
        Args: { p_normalized_email: string }
        Returns: Json
      }
      has_admin_access: { Args: never; Returns: boolean }
      is_storage_key_in_use: { Args: { p_key: string }; Returns: boolean }
      list_admin_users_paginated_atomic: {
        Args: {
          p_limit?: number
          p_page?: number
          p_role?: string
          p_search_query?: string
          p_status?: string
        }
        Returns: Json
      }
      publish_publication_atomic: {
        Args: { p_publication_id: string; p_user_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          id: string
          published_at: string | null
          service_id: string
          slug: string
          status: string
          summary: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "service_publications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      release_admin_action_lease: {
        Args: { p_action_key: string; p_lease_token: string; p_status: string }
        Returns: boolean
      }
      release_admin_invite_reservation: {
        Args: {
          p_actor_user_id: string
          p_idempotency_key: string
          p_lease_token: string
          p_normalized_email: string
          p_status: string
        }
        Returns: boolean
      }
      release_idempotency_key: {
        Args: {
          p_actor_user_id: string
          p_execution_token: string
          p_key: string
          p_operation: string
          p_response: Json
          p_status: string
        }
        Returns: boolean
      }
      create_hero_slide_atomic: {
        Args: {
          p_media_id: string
          p_user_id: string
          p_title_override?: string | null
        }
        Returns: string
      }
      delete_hero_slide_atomic: {
        Args: {
          p_slide_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      reorder_hero_slides_atomic: {
        Args: {
          p_slide_ids: string[]
          p_user_id: string
        }
        Returns: undefined
      }
      reorder_media_atomic: {
        Args: {
          p_media_ids: string[]
          p_publication_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      set_media_cover_atomic: {
        Args: {
          p_media_id: string
          p_publication_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      update_admin_user_role_atomic: {
        Args: {
          p_actor_user_id: string
          p_new_role: string
          p_target_user_id: string
        }
        Returns: Json
      }
      update_admin_user_status_atomic: {
        Args: {
          p_actor_user_id: string
          p_is_active: boolean
          p_target_user_id: string
        }
        Returns: Json
      }
      update_lead_status_atomic: {
        Args: { p_lead_id: string; p_new_status: string; p_user_id: string }
        Returns: Json
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
