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
          created_at: string
          user_id: string
          service_id: string
          start_time: string
          end_time: string
          status: 'scheduled' | 'completed' | 'canceled'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          service_id: string
          start_time: string
          end_time: string
          status?: 'scheduled' | 'completed' | 'canceled'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          service_id?: string
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'completed' | 'canceled'
          notes?: string | null
        }
      }
      feedback: {
        Row: {
          id: string
          created_at: string
          user_id: string
          appointment_id: string | null
          rating: number
          comments: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          appointment_id?: string | null
          rating: number
          comments?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          appointment_id?: string | null
          rating?: number
          comments?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role: 'client' | 'admin'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          role?: 'client' | 'admin'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          role?: 'client' | 'admin'
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          price: number
          duration: number
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          price: number
          duration: number
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          price?: number
          duration?: number
          image_url?: string | null
        }
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
  }
}
