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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          phone_verified: boolean
          charts_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          phone_verified?: boolean
          charts_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          phone_verified?: boolean
          charts_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      charts: {
        Row: {
          id: string
          user_id: string
          name: string
          birth_date: string
          birth_time: string
          birth_place: string
          latitude: number
          longitude: number
          timezone: string
          utc_offset: number
          ayanamsa: number | null
          ascendant_degree: number | null
          ascendant_sign: number | null
          moon_sign: number | null
          sun_sign: number | null
          nakshatra: string | null
          nakshatra_pada: number | null
          planets: Json | null
          houses: Json | null
          dashas: Json | null
          yogas: Json | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          birth_date: string
          birth_time: string
          birth_place: string
          latitude: number
          longitude: number
          timezone: string
          utc_offset: number
          ayanamsa?: number | null
          ascendant_degree?: number | null
          ascendant_sign?: number | null
          moon_sign?: number | null
          sun_sign?: number | null
          nakshatra?: string | null
          nakshatra_pada?: number | null
          planets?: Json | null
          houses?: Json | null
          dashas?: Json | null
          yogas?: Json | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          birth_date?: string
          birth_time?: string
          birth_place?: string
          latitude?: number
          longitude?: number
          timezone?: string
          utc_offset?: number
          ayanamsa?: number | null
          ascendant_degree?: number | null
          ascendant_sign?: number | null
          moon_sign?: number | null
          sun_sign?: number | null
          nakshatra?: string | null
          nakshatra_pada?: number | null
          planets?: Json | null
          houses?: Json | null
          dashas?: Json | null
          yogas?: Json | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          chart_id: string
          type: string
          title: string
          content: Json
          pdf_url: string | null
          price_paid: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chart_id: string
          type: string
          title: string
          content: Json
          pdf_url?: string | null
          price_paid: number
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chart_id?: string
          type?: string
          title?: string
          content?: Json
          pdf_url?: string | null
          price_paid?: number
          currency?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          report_id: string | null
          razorpay_order_id: string
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          amount: number
          currency: string
          status: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          report_id?: string | null
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount: number
          currency?: string
          status?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_id?: string | null
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount?: number
          currency?: string
          status?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
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
