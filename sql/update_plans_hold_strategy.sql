-- ============================================================
-- tyes pricing plans update — Brand Strategy on HOLD
-- All strategy flags set to false / 0 until feature launches
-- 5 tiers: Free Image · Brand Strategy · Campaign 5 · Campaign 10 · Custom
-- ============================================================

-- Ensure columns exist (idempotent)
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT '';
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS max_revisions INTEGER DEFAULT 0;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS strategy_included BOOLEAN DEFAULT false;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS strategy_call_included BOOLEAN DEFAULT false;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS strategy_addon_allowed BOOLEAN DEFAULT false;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS strategy_addon_price NUMERIC DEFAULT 0;

-- Deactivate all existing plans
UPDATE pricing_plans SET active = false;

-- Insert the 5 canonical tiers
-- strategy_* all FALSE — feature on hold
INSERT INTO pricing_plans
  (name, price, images, max_revisions, active, badge,
   strategy_included, strategy_call_included, strategy_addon_allowed, strategy_addon_price)
VALUES
  ('Free Image',      0,  1,  0, true, 'Free',           false, false, false, 0),
  ('Brand Strategy', 25,  0,  0, true, 'Strategy-First', false, false, false, 0),
  ('Campaign 5',     25,  5,  1, true, 'Popular',        false, false, false, 0),
  ('Campaign 10',    45, 10,  1, true, 'Go Big',         false, false, false, 0),
  ('Custom',          0,  0,  0, true, 'Enterprise',     false, false, false, 0);
