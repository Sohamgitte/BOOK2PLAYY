
/*
  # Book2Play - Sports Court Booking Platform

  ## Overview
  Initial schema for the Book2Play multi-role sports court booking platform.

  ## New Tables

  ### profiles
  - Extended user data linked to auth.users
  - Stores role (player, owner, admin), name, avatar, wallet balance, city

  ### courts
  - Sports court listings by owners
  - Contains sport type, pricing, amenities, location, verification status

  ### court_images
  - Multiple images per court

  ### court_slots
  - Time slot definitions per court (start/end time, price, status)

  ### bookings
  - Player court booking records with slot reference, status, payment

  ### reviews
  - Player reviews for courts (rating + comment)

  ### playpals
  - Players looking for teammates at a court

  ### tournaments
  - Tournament listings linked to courts

  ### notifications
  - In-app notifications for all roles

  ### court_amenities
  - Amenities list per court

  ## Security
  - RLS enabled on all tables
  - Policies scoped by auth.uid() and role
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'owner', 'admin')),
  phone text DEFAULT '',
  city text DEFAULT 'Mumbai',
  wallet_balance numeric(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Courts table
CREATE TABLE IF NOT EXISTS courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  sport text NOT NULL,
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT 'Mumbai',
  area text DEFAULT '',
  latitude numeric(10,6) DEFAULT 0,
  longitude numeric(10,6) DEFAULT 0,
  price_per_hour numeric(10,2) NOT NULL DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  cover_image text DEFAULT '',
  amenities text[] DEFAULT '{}',
  policies text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active verified courts"
  ON courts FOR SELECT
  USING (is_active = true AND is_verified = true);

CREATE POLICY "Owners can view own courts"
  ON courts FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert courts"
  ON courts FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own courts"
  ON courts FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins can view all courts"
  ON courts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can update all courts"
  ON courts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Court images
CREATE TABLE IF NOT EXISTS court_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE court_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view court images"
  ON court_images FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage court images"
  ON court_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "Owners can delete court images"
  ON court_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

-- Court slots
CREATE TABLE IF NOT EXISTS court_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE court_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view court slots"
  ON court_slots FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage court slots"
  ON court_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "Owners can update court slots"
  ON court_slots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  slot_id uuid REFERENCES court_slots(id),
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_method text DEFAULT 'online',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Owners can view bookings for their courts"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "Owners can update bookings for their courts"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Players can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- Playpals
CREATE TABLE IF NOT EXISTS playpals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  court_id uuid REFERENCES courts(id) ON DELETE SET NULL,
  sport text NOT NULL,
  skill_level text NOT NULL DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  play_date date,
  play_time time,
  description text DEFAULT '',
  city text DEFAULT 'Mumbai',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE playpals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active playpals"
  ON playpals FOR SELECT
  USING (is_active = true);

CREATE POLICY "Players can insert playpals"
  ON playpals FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update own playpals"
  ON playpals FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can delete own playpals"
  ON playpals FOR DELETE
  TO authenticated
  USING (player_id = auth.uid());

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid REFERENCES courts(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  sport text NOT NULL,
  description text DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  registration_fee numeric(10,2) DEFAULT 0,
  max_teams integer DEFAULT 8,
  prize_pool numeric(10,2) DEFAULT 0,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  city text DEFAULT 'Mumbai',
  cover_image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments"
  ON tournaments FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'booking', 'payment', 'alert', 'promo')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Favorite courts
CREATE TABLE IF NOT EXISTS favorite_courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, court_id)
);

ALTER TABLE favorite_courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own favorites"
  ON favorite_courts FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert favorites"
  ON favorite_courts FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can delete own favorites"
  ON favorite_courts FOR DELETE
  TO authenticated
  USING (player_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courts_sport ON courts(sport);
CREATE INDEX IF NOT EXISTS idx_courts_city ON courts(city);
CREATE INDEX IF NOT EXISTS idx_courts_owner ON courts(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_player ON bookings(player_id);
CREATE INDEX IF NOT EXISTS idx_bookings_court ON bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_court_slots_court_date ON court_slots(court_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_court ON reviews(court_id);
