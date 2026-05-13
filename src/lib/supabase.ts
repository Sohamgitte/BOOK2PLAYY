import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'player' | 'owner' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  phone: string;
  city: string;
  wallet_balance: number;
  is_active: boolean;
  created_at: string;
}

export interface Court {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  sport: string;
  address: string;
  city: string;
  area: string;
  price_per_hour: number;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_active: boolean;
  is_featured: boolean;
  cover_image: string;
  amenities: string[];
  policies: string;
}

export interface Booking {
  id: string;
  player_id: string;
  court_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  created_at: string;
}
