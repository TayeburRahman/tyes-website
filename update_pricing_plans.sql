-- Add missing columns to pricing_plans
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT '';
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS max_revisions INTEGER DEFAULT 0;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS strategy_included BOOLEAN DEFAULT false;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS strategy_call_included BOOLEAN DEFAULT false;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS strategy_addon_allowed BOOLEAN DEFAULT false;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS strategy_addon_price NUMERIC DEFAULT 0;

-- Soft-delete existing plans to clean up the dashboard view
UPDATE pricing_plans SET active = false;

-- Insert the 5 new plans
INSERT INTO pricing_plans (name, price, images, max_revisions, active, badge, strategy_included, strategy_call_included, strategy_addon_allowed, strategy_addon_price)
VALUES 
  ('Free Image', 0, 1, 0, true, '', false, false, true, 25),
  ('Brand Strategy', 25, 0, 0, true, '', true, false, false, 0),
  ('Campaign 5', 25, 5, 1, true, 'Popular', true, false, false, 0),
  ('Campaign 10', 45, 10, 1, true, 'Go Big', true, false, false, 0),
  ('Custom', 0, 0, 0, true, 'Enterprise', true, true, false, 0);
