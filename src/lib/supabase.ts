import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          user_type: 'buyer' | 'developer'
          company_name?: string
          license_number?: string
          phone?: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          user_type: 'buyer' | 'developer'
          company_name?: string
          license_number?: string
          phone?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          user_type?: 'buyer' | 'developer'
          company_name?: string
          license_number?: string
          phone?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          location: string
          property_type: string
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          images: string[]
          status: 'active' | 'sold' | 'pending' | 'draft'
          developer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          location: string
          property_type: string
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          images?: string[]
          status?: 'active' | 'sold' | 'pending' | 'draft'
          developer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          location?: string
          property_type?: string
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          images?: string[]
          status?: 'active' | 'sold' | 'pending' | 'draft'
          developer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          featured_image?: string
          author_id: string
          status: 'published' | 'draft'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt: string
          featured_image?: string
          author_id: string
          status?: 'published' | 'draft'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          featured_image?: string
          author_id?: string
          status?: 'published' | 'draft'
          created_at?: string
          updated_at?: string
        }
      }
      scheduled_visits: {
        Row: {
          id: string
          property_id: string
          buyer_id: string
          developer_id: string
          scheduled_date: string
          scheduled_time: string
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          message?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          buyer_id: string
          developer_id: string
          scheduled_date: string
          scheduled_time: string
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          message?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          buyer_id?: string
          developer_id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          message?: string
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
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
