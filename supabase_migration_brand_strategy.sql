CREATE TABLE IF NOT EXISTS brand_strategy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_id UUID REFERENCES orders(id),
  brand_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to TEXT NOT NULL DEFAULT 'Raluca',
  delivered_pdf_url TEXT,
  source TEXT NOT NULL,
  tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE plans ADD COLUMN IF NOT EXISTS strategy_included BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS strategy_call_included BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS strategy_addon_allowed BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS strategy_addon_price NUMERIC DEFAULT 0;

UPDATE plans SET is_active = false;

INSERT INTO plans (name, price, images_included, delivery_time, revisions, is_active, strategy_included, strategy_call_included, strategy_addon_allowed, strategy_addon_price, is_custom)
VALUES 
('Free Image', 0, 1, 'From 3H', 0, true, false, false, true, 25, false),
('Brand Strategy', 25, 0, '3 business days', 0, true, true, false, false, 0, false),
('Campaign 5', 25, 5, 'From 24H', 1, true, true, false, false, 0, false),
('Campaign 10', 45, 10, 'From 24H', 1, true, true, false, false, 0, false),
('Custom', 0, 0, 'Per-scope', 0, true, true, true, false, 0, true);
