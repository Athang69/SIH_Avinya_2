/*
  # Oilseed Value Chain Platform Database Schema

  ## Overview
  Complete database schema for AI-enabled oilseed value chain platform supporting
  farmers, FPOs, processors, retailers, and policymakers.

  ## New Tables

  ### 1. profiles
  Extended user profile information linked to auth.users
  - `id` (uuid, FK to auth.users)
  - `role` (enum: farmer, fpo, processor, retailer, policymaker, admin)
  - `full_name` (text)
  - `organization` (text, optional)
  - `phone` (text)
  - `location` (jsonb: state, district, coordinates)
  - `created_at`, `updated_at` (timestamps)

  ### 2. crops
  Oilseed crop master data and farmer plantings
  - `id` (uuid, PK)
  - `farmer_id` (uuid, FK to profiles)
  - `crop_type` (text: soybean, groundnut, mustard, sunflower, etc.)
  - `area_hectares` (numeric)
  - `planting_date` (date)
  - `expected_harvest_date` (date)
  - `actual_harvest_date` (date, optional)
  - `status` (enum: planned, planted, growing, harvested)
  - `location` (jsonb)
  - `created_at`, `updated_at` (timestamps)

  ### 3. advisories
  AI-generated advisories for crop planning, weather, pest management
  - `id` (uuid, PK)
  - `advisory_type` (enum: crop_planning, weather, pest_management, market_price)
  - `target_audience` (text: specific farmer_id or broadcast)
  - `title` (text)
  - `content` (text)
  - `priority` (enum: low, medium, high, critical)
  - `valid_until` (timestamp)
  - `metadata` (jsonb: AI model info, satellite data refs)
  - `created_at` (timestamp)

  ### 4. inventory
  Procurement, storage, and processing inventory tracking
  - `id` (uuid, PK)
  - `crop_id` (uuid, FK to crops, optional)
  - `owner_id` (uuid, FK to profiles)
  - `location_id` (uuid, FK to warehouses)
  - `crop_type` (text)
  - `quantity_kg` (numeric)
  - `quality_grade` (text)
  - `procurement_date` (date)
  - `status` (enum: procured, stored, in_transit, processed, sold)
  - `price_per_kg` (numeric)
  - `created_at`, `updated_at` (timestamps)

  ### 5. warehouses
  Storage infrastructure mapping
  - `id` (uuid, PK)
  - `name` (text)
  - `operator_id` (uuid, FK to profiles)
  - `location` (jsonb: address, coordinates)
  - `capacity_tonnes` (numeric)
  - `current_utilization_tonnes` (numeric)
  - `facilities` (jsonb: temperature control, pest control, etc.)
  - `status` (enum: active, inactive, maintenance)
  - `created_at`, `updated_at` (timestamps)

  ### 6. logistics
  Transportation and logistics tracking
  - `id` (uuid, PK)
  - `inventory_id` (uuid, FK to inventory)
  - `from_location` (jsonb)
  - `to_location` (jsonb)
  - `transporter_id` (uuid, FK to profiles, optional)
  - `vehicle_number` (text)
  - `dispatch_date` (timestamp)
  - `expected_arrival` (timestamp)
  - `actual_arrival` (timestamp, optional)
  - `status` (enum: scheduled, in_transit, delivered, delayed)
  - `tracking_data` (jsonb: GPS coordinates, checkpoints)
  - `created_at`, `updated_at` (timestamps)

  ### 7. traceability
  Blockchain-based traceability records (farm to fork)
  - `id` (uuid, PK)
  - `batch_id` (text, unique)
  - `crop_id` (uuid, FK to crops, optional)
  - `inventory_id` (uuid, FK to inventory, optional)
  - `stage` (enum: farm, procurement, storage, processing, retail)
  - `actor_id` (uuid, FK to profiles)
  - `timestamp` (timestamp)
  - `location` (jsonb)
  - `action` (text: harvested, procured, stored, processed, sold)
  - `hash` (text: blockchain hash)
  - `previous_hash` (text)
  - `metadata` (jsonb)
  - `created_at` (timestamp)

  ### 8. market_prices
  Real-time market price data and predictions
  - `id` (uuid, PK)
  - `crop_type` (text)
  - `market_location` (text)
  - `price_per_kg` (numeric)
  - `date` (date)
  - `is_prediction` (boolean)
  - `confidence_score` (numeric, optional)
  - `source` (text: mandi, api, ai_model)
  - `created_at` (timestamp)

  ### 9. credit_facilities
  Credit and insurance facilitation
  - `id` (uuid, PK)
  - `farmer_id` (uuid, FK to profiles)
  - `facility_type` (enum: credit, insurance, subsidy)
  - `provider` (text)
  - `amount` (numeric)
  - `status` (enum: applied, approved, disbursed, rejected, completed)
  - `application_date` (date)
  - `approval_date` (date, optional)
  - `performance_score` (numeric, optional)
  - `metadata` (jsonb)
  - `created_at`, `updated_at` (timestamps)

  ### 10. analytics_metrics
  Platform analytics and KPIs for policymakers
  - `id` (uuid, PK)
  - `metric_type` (text: production, procurement, losses, prices)
  - `time_period` (text: daily, weekly, monthly, yearly)
  - `period_start` (date)
  - `period_end` (date)
  - `region` (text)
  - `crop_type` (text, optional)
  - `value` (numeric)
  - `unit` (text)
  - `metadata` (jsonb)
  - `created_at` (timestamp)

  ## Security
  - Enable RLS on all tables
  - Role-based access policies for each stakeholder type
  - Farmers can only access their own data
  - FPOs, processors, retailers access relevant supply chain data
  - Policymakers get aggregated read-only access
  - Admins have full access
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('farmer', 'fpo', 'processor', 'retailer', 'policymaker', 'admin');
CREATE TYPE crop_status AS ENUM ('planned', 'planted', 'growing', 'harvested');
CREATE TYPE advisory_type AS ENUM ('crop_planning', 'weather', 'pest_management', 'market_price');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE inventory_status AS ENUM ('procured', 'stored', 'in_transit', 'processed', 'sold');
CREATE TYPE warehouse_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE logistics_status AS ENUM ('scheduled', 'in_transit', 'delivered', 'delayed');
CREATE TYPE traceability_stage AS ENUM ('farm', 'procurement', 'storage', 'processing', 'retail');
CREATE TYPE facility_type AS ENUM ('credit', 'insurance', 'subsidy');
CREATE TYPE facility_status AS ENUM ('applied', 'approved', 'disbursed', 'rejected', 'completed');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name text NOT NULL,
  organization text,
  phone text,
  location jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  crop_type text NOT NULL,
  area_hectares numeric NOT NULL CHECK (area_hectares > 0),
  planting_date date NOT NULL,
  expected_harvest_date date NOT NULL,
  actual_harvest_date date,
  status crop_status DEFAULT 'planned',
  location jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Advisories table
CREATE TABLE IF NOT EXISTS advisories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisory_type advisory_type NOT NULL,
  target_audience text,
  title text NOT NULL,
  content text NOT NULL,
  priority priority_level DEFAULT 'medium',
  valid_until timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  operator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  location jsonb DEFAULT '{}'::jsonb,
  capacity_tonnes numeric NOT NULL CHECK (capacity_tonnes > 0),
  current_utilization_tonnes numeric DEFAULT 0 CHECK (current_utilization_tonnes >= 0),
  facilities jsonb DEFAULT '{}'::jsonb,
  status warehouse_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  crop_type text NOT NULL,
  quantity_kg numeric NOT NULL CHECK (quantity_kg >= 0),
  quality_grade text,
  procurement_date date NOT NULL,
  status inventory_status DEFAULT 'procured',
  price_per_kg numeric CHECK (price_per_kg >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Logistics table
CREATE TABLE IF NOT EXISTS logistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  from_location jsonb DEFAULT '{}'::jsonb,
  to_location jsonb DEFAULT '{}'::jsonb,
  transporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  vehicle_number text,
  dispatch_date timestamptz NOT NULL,
  expected_arrival timestamptz NOT NULL,
  actual_arrival timestamptz,
  status logistics_status DEFAULT 'scheduled',
  tracking_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Traceability table
CREATE TABLE IF NOT EXISTS traceability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id text UNIQUE NOT NULL,
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  inventory_id uuid REFERENCES inventory(id) ON DELETE SET NULL,
  stage traceability_stage NOT NULL,
  actor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  location jsonb DEFAULT '{}'::jsonb,
  action text NOT NULL,
  hash text NOT NULL,
  previous_hash text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Market prices table
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type text NOT NULL,
  market_location text NOT NULL,
  price_per_kg numeric NOT NULL CHECK (price_per_kg >= 0),
  date date NOT NULL,
  is_prediction boolean DEFAULT false,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Credit facilities table
CREATE TABLE IF NOT EXISTS credit_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  facility_type facility_type NOT NULL,
  provider text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status facility_status DEFAULT 'applied',
  application_date date NOT NULL DEFAULT CURRENT_DATE,
  approval_date date,
  performance_score numeric CHECK (performance_score >= 0 AND performance_score <= 100),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics metrics table
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  time_period text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  region text NOT NULL,
  crop_type text,
  value numeric NOT NULL,
  unit text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_crops_farmer_id ON crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON crops(status);
CREATE INDEX IF NOT EXISTS idx_advisories_type ON advisories(advisory_type);
CREATE INDEX IF NOT EXISTS idx_advisories_priority ON advisories(priority);
CREATE INDEX IF NOT EXISTS idx_inventory_owner_id ON inventory(owner_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_logistics_status ON logistics(status);
CREATE INDEX IF NOT EXISTS idx_traceability_batch_id ON traceability(batch_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop_date ON market_prices(crop_type, date);
CREATE INDEX IF NOT EXISTS idx_credit_facilities_farmer_id ON credit_facilities(farmer_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_type_period ON analytics_metrics(metric_type, period_start, period_end);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE traceability ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
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

-- RLS Policies for crops
CREATE POLICY "Farmers can view own crops"
  ON crops FOR SELECT
  TO authenticated
  USING (
    farmer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('fpo', 'processor', 'retailer', 'policymaker', 'admin'))
  );

CREATE POLICY "Farmers can insert own crops"
  ON crops FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
  );

CREATE POLICY "Farmers can update own crops"
  ON crops FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can delete own crops"
  ON crops FOR DELETE
  TO authenticated
  USING (farmer_id = auth.uid());

-- RLS Policies for advisories
CREATE POLICY "All authenticated users can view advisories"
  ON advisories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and policymakers can create advisories"
  ON advisories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'policymaker'))
  );

-- RLS Policies for warehouses
CREATE POLICY "All authenticated users can view warehouses"
  ON warehouses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Operators can manage own warehouses"
  ON warehouses FOR ALL
  TO authenticated
  USING (
    operator_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for inventory
CREATE POLICY "Users can view relevant inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('fpo', 'processor', 'retailer', 'policymaker', 'admin'))
  );

CREATE POLICY "Owners can manage own inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for logistics
CREATE POLICY "Stakeholders can view relevant logistics"
  ON logistics FOR SELECT
  TO authenticated
  USING (
    transporter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM inventory i
      WHERE i.id = logistics.inventory_id
      AND (i.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('fpo', 'processor', 'retailer', 'admin')))
    )
  );

CREATE POLICY "Transporters can update logistics"
  ON logistics FOR UPDATE
  TO authenticated
  USING (
    transporter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('fpo', 'processor', 'admin'))
  );

-- RLS Policies for traceability
CREATE POLICY "All authenticated users can view traceability"
  ON traceability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stakeholders can create traceability records"
  ON traceability FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- RLS Policies for market_prices
CREATE POLICY "All authenticated users can view market prices"
  ON market_prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage market prices"
  ON market_prices FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'policymaker'))
  );

-- RLS Policies for credit_facilities
CREATE POLICY "Farmers can view own credit facilities"
  ON credit_facilities FOR SELECT
  TO authenticated
  USING (
    farmer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'policymaker'))
  );

CREATE POLICY "Farmers can apply for credit facilities"
  ON credit_facilities FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
  );

CREATE POLICY "Admins can update credit facilities"
  ON credit_facilities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'policymaker'))
  );

-- RLS Policies for analytics_metrics
CREATE POLICY "All authenticated users can view analytics"
  ON analytics_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage analytics"
  ON analytics_metrics FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'policymaker'))
  );