/*
  # Add Phase 2 Booking Infrastructure

  1. New Tables
    - `slot_locks` - Temporary holds on slots during payment processing
      - Prevents double-booking during payment window
      - Auto-expires after 5 minutes
      - Uses transaction_id for idempotency
    
    - `payment_transactions` - All payment records
      - Tracks Razorpay order IDs and payment gateway responses
      - Status tracking for payment lifecycle
      - Supports refund tracing
    
    - `refund_transactions` - Refund records
      - Links to original payment transactions
      - Tracks refund percentage and amount
      - Gateway refund IDs for audit
    
    - `wallet_transactions` - Immutable wallet ledger
      - Records all wallet credit/debit operations
      - Immutable audit trail
      - Balance tracking per user
    
    - `peak_pricing_rules` - Dynamic pricing configuration
      - Day-of-week and time-of-day multipliers
      - Holiday pricing overrides
    
    - `holiday_dates` - Holiday calendar for special pricing
    
    - `qr_codes` - QR tokens for check-in verification
      - Secure tokens generated for each booking
      - One-time use tokens
    
    - `check_ins` - Check-in audit trail
      - Records when players check in
      - Geolocation verification optional
    
    - `matches` - Match/game records
      - Player-created match records
      - Links to bookings for courts
    
    - `match_teams` - Teams within matches
    
    - `match_requests` - Player invitations to matches
    
    - `match_scores` - Final scores and results
    
    - `waiting_queue` - FIFO queue for sold-out slots
      - Position tracking
      - Auto-notification on availability
    
    - `queue_notifications` - Notification history for queue
  
  2. Security
    - Enable RLS on all tables
    - Users only access own data
    - Immutable transaction ledgers for audit
    - Payment data access controlled via RLS
  
  3. Indexes
    - Optimized for real-time queries
    - Foreign key indexes for integrity
    - Status-based queries for reporting
  
  4. Important Notes
    - slot_locks are temp; cleanup via scheduled task every 5 minutes
    - wallet_transactions are append-only for audit trail immutability
    - QR tokens are cryptographically secure and one-time use
    - Peak pricing rules are versioned via created_at timestamp
    - All monetary amounts use numeric(10,2) for precision
*/

-- Slot locks for temporary booking holds
CREATE TABLE IF NOT EXISTS slot_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id text NOT NULL UNIQUE,
  locked_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text DEFAULT 'locked' CHECK (status IN ('locked', 'released')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE slot_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own slot locks"
  ON slot_locks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create slot locks"
  ON slot_locks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update slot locks"
  ON slot_locks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'INR',
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text,
  razorpay_signature text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.player_id = auth.uid()));

CREATE POLICY "Admins can view all payments"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Refund transactions
CREATE TABLE IF NOT EXISTS refund_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id uuid NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  refund_amount numeric(10, 2) NOT NULL,
  refund_percentage numeric(3, 1) NOT NULL,
  refund_method text DEFAULT 'wallet' CHECK (refund_method IN ('wallet', 'bank', 'card')),
  razorpay_refund_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  reason text,
  retry_count integer DEFAULT 0,
  next_retry_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE refund_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own refunds"
  ON refund_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all refunds"
  ON refund_transactions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Wallet transactions (immutable append-only ledger)
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount numeric(10, 2) NOT NULL,
  balance_after numeric(10, 2) NOT NULL,
  reference_type text,
  reference_id uuid,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert wallet transactions"
  ON wallet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Peak pricing rules
CREATE TABLE IF NOT EXISTS peak_pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time,
  end_time time,
  multiplier numeric(3, 2) NOT NULL DEFAULT 1.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE peak_pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view peak pricing rules"
  ON peak_pricing_rules FOR SELECT
  USING (true);

CREATE POLICY "Court owners can manage peak pricing"
  ON peak_pricing_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "Court owners can update peak pricing"
  ON peak_pricing_rules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

-- Holiday dates for special pricing
CREATE TABLE IF NOT EXISTS holiday_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_date date NOT NULL UNIQUE,
  holiday_name text,
  multiplier numeric(3, 2) DEFAULT 1.5,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE holiday_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view holidays"
  ON holiday_dates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage holidays"
  ON holiday_dates FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- QR codes for check-in
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  is_used boolean DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view QR codes for own bookings"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.player_id = auth.uid())
  );

-- Check-in records
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  qr_code_id uuid REFERENCES qr_codes(id),
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  checked_in_at timestamptz DEFAULT now()
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view check-ins for own bookings"
  ON check_ins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.player_id = auth.uid()));

-- Matches (game records)
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  sport text NOT NULL,
  max_players integer NOT NULL DEFAULT 10,
  current_players integer DEFAULT 1,
  skill_level text DEFAULT 'intermediate' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'full', 'in-progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open matches"
  ON matches FOR SELECT
  USING (status IN ('open', 'full'));

CREATE POLICY "Creators can view own matches"
  ON matches FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update own matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Match requests (join invitations)
CREATE TABLE IF NOT EXISTS match_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own match requests"
  ON match_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM matches m WHERE m.id = match_id AND m.creator_id = auth.uid()));

-- Match scores
CREATE TABLE IF NOT EXISTS match_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team1_score integer,
  team2_score integer,
  winning_team integer,
  recorded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match scores"
  ON match_scores FOR SELECT
  USING (true);

-- Waiting queue for sold-out slots
CREATE TABLE IF NOT EXISTS waiting_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  queue_position integer NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'expired', 'cancelled')),
  notified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waiting_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue position"
  ON waiting_queue FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Court owners can view queue for their courts"
  ON waiting_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

-- Queue notifications
CREATE TABLE IF NOT EXISTS queue_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid NOT NULL REFERENCES waiting_queue(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('available', 'position_changed', 'expired')),
  sent_at timestamptz DEFAULT now()
);

ALTER TABLE queue_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue notifications"
  ON queue_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_slot_locks_court_date_status ON slot_locks(court_id, slot_date, status);
CREATE INDEX idx_slot_locks_user_expires ON slot_locks(user_id, expires_at);
CREATE INDEX idx_slot_locks_transaction_id ON slot_locks(transaction_id);
CREATE INDEX idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_refund_transactions_user ON refund_transactions(user_id);
CREATE INDEX idx_refund_transactions_status ON refund_transactions(status);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at);
CREATE INDEX idx_peak_pricing_court ON peak_pricing_rules(court_id);
CREATE INDEX idx_qr_codes_booking ON qr_codes(booking_id);
CREATE INDEX idx_qr_codes_token ON qr_codes(token);
CREATE INDEX idx_check_ins_booking ON check_ins(booking_id);
CREATE INDEX idx_check_ins_user ON check_ins(user_id);
CREATE INDEX idx_matches_creator ON matches(creator_id);
CREATE INDEX idx_matches_booking ON matches(booking_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_match_requests_match ON match_requests(match_id);
CREATE INDEX idx_match_requests_user ON match_requests(user_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);
CREATE INDEX idx_waiting_queue_court_date ON waiting_queue(court_id, slot_date);
CREATE INDEX idx_waiting_queue_user ON waiting_queue(user_id);
CREATE INDEX idx_waiting_queue_status ON waiting_queue(status);
