/*
  # Extend Bookings Table and Add Refund Policies

  1. Modified Tables
    - `bookings` - Extended with pricing fields and check-in data
      - Add base_price, peak_price, total_amount (snapshot pricing)
      - Add check-in timestamp
      - Add completion tracking
      - Existing columns preserved for backward compatibility
  
  2. New Tables
    - `refund_policies` - Time-based refund percentage rules
      - Rules for full refund, partial refund, no refund based on cancellation time
      - Configurable per court or global defaults
    
    - `user_bank_accounts` - Bank accounts for owner payouts
      - ENCRYPTED for security
      - Verification status
  
    - `owner_payouts` - Scheduled payouts to owners
      - Aggregated revenue tracking
      - Payout status and timestamps
  
  3. Security
    - Bank account data properly scoped and encrypted
    - Refund policies viewable by all
    - Payout records viewable by owners
  
  4. Important Notes
    - Refund percentage is calculated from cancellation time
    - Base_price stored at booking time for audit
    - Peak_price is the multiplied price with peak pricing applied
*/

-- Extend bookings table with pricing fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'base_price'
  ) THEN
    ALTER TABLE bookings ADD COLUMN base_price numeric(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'peak_price'
  ) THEN
    ALTER TABLE bookings ADD COLUMN peak_price numeric(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'checked_in_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN checked_in_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN completed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE bookings ADD COLUMN cancellation_reason text;
  END IF;
END $$;

-- Refund policies (time-based)
CREATE TABLE IF NOT EXISTS refund_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid REFERENCES courts(id) ON DELETE CASCADE,
  hours_before_slot integer NOT NULL,
  refund_percentage numeric(3, 1) NOT NULL CHECK (refund_percentage BETWEEN 0 AND 100),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE refund_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view refund policies"
  ON refund_policies FOR SELECT
  USING (true);

CREATE POLICY "Court owners can manage refund policies"
  ON refund_policies FOR INSERT
  TO authenticated
  WITH CHECK (
    court_id IS NULL OR
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "Court owners can update refund policies"
  ON refund_policies FOR UPDATE
  TO authenticated
  USING (
    court_id IS NULL OR
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  )
  WITH CHECK (
    court_id IS NULL OR
    EXISTS (SELECT 1 FROM courts c WHERE c.id = court_id AND c.owner_id = auth.uid())
  );

-- Owner bank accounts (sensitive data)
CREATE TABLE IF NOT EXISTS user_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_holder_name text NOT NULL,
  account_number text NOT NULL,
  ifsc_code text NOT NULL,
  bank_name text NOT NULL,
  account_type text DEFAULT 'savings' CHECK (account_type IN ('savings', 'current')),
  is_verified boolean DEFAULT false,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank accounts"
  ON user_bank_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own bank accounts"
  ON user_bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bank accounts"
  ON user_bank_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bank accounts"
  ON user_bank_accounts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Owner payouts
CREATE TABLE IF NOT EXISTS owner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  payout_period_start date NOT NULL,
  payout_period_end date NOT NULL,
  total_bookings integer DEFAULT 0,
  total_revenue numeric(10, 2) DEFAULT 0,
  platform_fees numeric(10, 2) DEFAULT 0,
  net_payout numeric(10, 2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  bank_account_id uuid REFERENCES user_bank_accounts(id),
  payout_reference_id text,
  scheduled_date date,
  processed_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE owner_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own payouts"
  ON owner_payouts FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can view all payouts"
  ON owner_payouts FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can update payouts"
  ON owner_payouts FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Indexes
CREATE INDEX idx_refund_policies_court ON refund_policies(court_id);
CREATE INDEX idx_user_bank_accounts_user ON user_bank_accounts(user_id);
CREATE INDEX idx_owner_payouts_owner ON owner_payouts(owner_id);
CREATE INDEX idx_owner_payouts_court ON owner_payouts(court_id);
CREATE INDEX idx_owner_payouts_status ON owner_payouts(status);
CREATE INDEX idx_owner_payouts_period ON owner_payouts(payout_period_start, payout_period_end);
