export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          client_id: string
          service_id: string
          staff_id: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
          promotion_id: string | null
        }
        Insert: {
          id?: string
          client_id: string
          service_id: string
          staff_id: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
          promotion_id?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          service_id?: string
          staff_id?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
          promotion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_staff_id_fkey'
            columns: ['staff_id']
            referencedRelation: 'staff'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_promotion_id_fkey'
            columns: ['promotion_id']
            referencedRelation: 'promotions'
            referencedColumns: ['id']
          }
        ]
      }
      business_settings: {
        Row: {
          id: string
          business_name: string
          address: string
          city: string
          postal_code: string
          country: string
          phone: string
          email: string
          website: string | null
          logo_url: string | null
          currency: string
          tax_rate: number
          working_hours: Json
          min_appointment_notice: number
          appointment_buffer: number
          max_future_booking_days: number
          cancellation_policy: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          address: string
          city: string
          postal_code: string
          country: string
          phone: string
          email: string
          website?: string | null
          logo_url?: string | null
          currency?: string
          tax_rate?: number
          working_hours?: Json
          min_appointment_notice?: number
          appointment_buffer?: number
          max_future_booking_days?: number
          cancellation_policy?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          phone?: string
          email?: string
          website?: string | null
          logo_url?: string | null
          currency?: string
          tax_rate?: number
          working_hours?: Json
          min_appointment_notice?: number
          appointment_buffer?: number
          max_future_booking_days?: number
          cancellation_policy?: string | null
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          client_id: string
          appointment_id: string | null
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
          staff_id: string | null
          service_id: string | null
        }
        Insert: {
          id?: string
          client_id: string
          appointment_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
          staff_id?: string | null
          service_id?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          appointment_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
          staff_id?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'feedback_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'feedback_appointment_id_fkey'
            columns: ['appointment_id']
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'feedback_staff_id_fkey'
            columns: ['staff_id']
            referencedRelation: 'staff'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'feedback_service_id_fkey'
            columns: ['service_id']
            referencedRelation: 'services'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          email: string
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          created_at: string
          role: 'client' | 'admin' | 'staff'
          avatar_url: string | null
          last_login: string | null
          is_active: boolean
          theme_preference: 'light' | 'dark' | null
          language_preference: 'en' | 'de' | 'es' | null
        }
        Insert: {
          id: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          created_at?: string
          role?: 'client' | 'admin' | 'staff'
          avatar_url?: string | null
          last_login?: string | null
          is_active?: boolean
          theme_preference?: 'light' | 'dark' | null
          language_preference?: 'en' | 'de' | 'es' | null
        }
        Update: {
          id?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          created_at?: string
          role?: 'client' | 'admin' | 'staff'
          avatar_url?: string | null
          last_login?: string | null
          is_active?: boolean
          theme_preference?: 'light' | 'dark' | null
          language_preference?: 'en' | 'de' | 'es' | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      promotions: {
        Row: {
          id: string
          name: string
          description: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          start_date: string
          end_date: string
          code: string | null
          is_active: boolean
          service_id: string | null
          created_at: string
          updated_at: string
          usage_limit: number | null
          current_usage: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          start_date: string
          end_date: string
          code?: string | null
          is_active?: boolean
          service_id?: string | null
          created_at?: string
          updated_at?: string
          usage_limit?: number | null
          current_usage?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed_amount'
          discount_value?: number
          start_date?: string
          end_date?: string
          code?: string | null
          is_active?: boolean
          service_id?: string | null
          created_at?: string
          updated_at?: string
          usage_limit?: number | null
          current_usage?: number
        }
        Relationships: [
          {
            foreignKeyName: 'promotions_service_id_fkey'
            columns: ['service_id']
            referencedRelation: 'services'
            referencedColumns: ['id']
          }
        ]
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          duration: number
          category: string
          image_url: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          duration: number
          category: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number
          category?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      staff: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          bio: string | null
          position: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          bio?: string | null
          position: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          bio?: string | null
          position?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'staff_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      staff_schedule: {
        Row: {
          id: string
          staff_id: string
          day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
          start_time: string
          end_time: string
          is_working: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
          start_time: string
          end_time: string
          is_working?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          day_of_week?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
          start_time?: string
          end_time?: string
          is_working?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'staff_schedule_staff_id_fkey'
            columns: ['staff_id']
            referencedRelation: 'staff'
            referencedColumns: ['id']
          }
        ]
      }
      staff_specialties: {
        Row: {
          staff_id: string
          service_id: string
          created_at: string
        }
        Insert: {
          staff_id: string
          service_id: string
          created_at?: string
        }
        Update: {
          staff_id?: string
          service_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'staff_specialties_service_id_fkey'
            columns: ['service_id']
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'staff_specialties_staff_id_fkey'
            columns: ['staff_id']
            referencedRelation: 'staff'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_appointment_availability: {
        Args: {
          p_staff_id: string
          p_start_time: string
          p_end_time: string
          p_appointment_id?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey'
            columns: ['bucket_id']
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
