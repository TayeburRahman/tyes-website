const fs = require('fs');
require('dotenv').config();

async function runSQL() {
  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(.*?)\.supabase\.co/)[1];
  const url = `https://api.supabase.com/v1/projects/${projectId}/database/query`;

  const sql = `
  -- Add new boolean flags if they don't exist
  DO $$ 
  BEGIN 
    BEGIN
      ALTER TABLE pricing_plans ADD COLUMN strategy_included BOOLEAN DEFAULT false;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END;
    BEGIN
      ALTER TABLE pricing_plans ADD COLUMN strategy_call_included BOOLEAN DEFAULT false;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END;
    BEGIN
      ALTER TABLE pricing_plans ADD COLUMN strategy_addon_allowed BOOLEAN DEFAULT false;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END;
    BEGIN
      ALTER TABLE pricing_plans ADD COLUMN strategy_addon_price INTEGER DEFAULT 0;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END;
  END $$;

  -- Insert the new plans if they don't exist
  INSERT INTO pricing_plans (name, price, images, max_revisions, active, badge, strategy_included, strategy_call_included, strategy_addon_allowed, strategy_addon_price)
  VALUES 
    ('Free Image', 0, 1, 3, true, '1 Free Test', false, false, false, 0),
    ('Brand Strategy', 25, 0, 0, true, 'Snapshot', true, false, false, 0),
    ('Campaign 5', 250, 5, 3, true, 'Starter', false, false, true, 25),
    ('Campaign 10', 450, 10, 3, true, 'Growth', false, false, true, 25),
    ('Custom', 0, 0, 3, true, 'Enterprise', true, true, false, 0)
  ON CONFLICT DO NOTHING;
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_MANAGEMENT_TOKEN}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (response.ok) {
      console.log('Migration completed successfully.');
    } else {
      const data = await response.json();
      console.error('Migration failed:', data);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

runSQL();
