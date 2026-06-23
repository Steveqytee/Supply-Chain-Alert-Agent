/*
# Create flagged_orders table

1. New Tables
- `flagged_orders`
  - `id` (serial, primary key) — auto-incrementing internal ID
  - `order_id` (integer, not null, unique) — the external order identifier
  - `customer_name` (text, not null) — customer or company name
  - `total_amount` (integer, not null) — order total in dollars
  - `stock_level` (integer, not null) — current stock level
  - `email` (text, not null) — masked contact email
  - `created_at` (timestamptz, default now()) — record timestamp

2. Security
- Enable RLS on `flagged_orders`.
- Allow anon + authenticated full CRUD since this is a single-tenant dashboard with no auth requirement.
*/

CREATE TABLE IF NOT EXISTS flagged_orders (
  id serial PRIMARY KEY,
  order_id integer NOT NULL UNIQUE,
  customer_name text NOT NULL,
  total_amount integer NOT NULL,
  stock_level integer NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flagged_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_flagged_orders" ON flagged_orders;
CREATE POLICY "anon_select_flagged_orders" ON flagged_orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_flagged_orders" ON flagged_orders;
CREATE POLICY "anon_insert_flagged_orders" ON flagged_orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_flagged_orders" ON flagged_orders;
CREATE POLICY "anon_update_flagged_orders" ON flagged_orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_flagged_orders" ON flagged_orders;
CREATE POLICY "anon_delete_flagged_orders" ON flagged_orders FOR DELETE
  TO anon, authenticated USING (true);
