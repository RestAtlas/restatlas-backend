CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  facilities text[],
  fuel_diesel numeric(6,3),
  fuel_regular numeric(6,3),
  overnight boolean DEFAULT false,
  bathroom_rating numeric(2,1),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stops_latlng ON stops (lat, lng);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid REFERENCES stops(id),
  lat double precision,
  lng double precision,
  bathroom_clean boolean,
  parking_status text,
  shower_available boolean,
  overnight_allowed boolean,
  photo_url text,
  created_at timestamptz DEFAULT now()
);
