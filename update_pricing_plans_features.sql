-- Add features and description columns to pricing_plans
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- Default features for some existing plans based on services.html
UPDATE pricing_plans SET features = '[
  {"text": "3 revisions / image", "icon": "check"},
  {"text": "Commercial license", "icon": "check"},
  {"text": "Delivery: 1 hour", "icon": "clock"},
  {"text": "AI generated + retouched", "icon": "check"}
]'::jsonb, description = 'Try us risk-free' WHERE name = 'Free Image';

UPDATE pricing_plans SET features = '[
  {"text": "3 revisions / image", "icon": "check"},
  {"text": "Commercial license", "icon": "check"},
  {"text": "Delivery: 1 hour", "icon": "clock"},
  {"text": "AI generated + retouched", "icon": "check"}
]'::jsonb, description = 'One stunning image' WHERE name = 'Single';

UPDATE pricing_plans SET features = '[
  {"text": "3 revisions / image", "icon": "check"},
  {"text": "Commercial license", "icon": "check"},
  {"text": "Delivery: 2 hours", "icon": "clock"},
  {"text": "AI generated + retouched", "icon": "check"}
]'::jsonb, description = 'Small campaign' WHERE name = 'Starter';

UPDATE pricing_plans SET features = '[
  {"text": "3 revisions / image", "icon": "check"},
  {"text": "Commercial license", "icon": "check"},
  {"text": "Delivery: 3 hours", "icon": "clock"},
  {"text": "AI generated + retouched", "icon": "check"}
]'::jsonb, description = 'Full product line' WHERE name = 'Growth';

UPDATE pricing_plans SET description = 'Custom enterprise needs' WHERE name = 'Custom';
