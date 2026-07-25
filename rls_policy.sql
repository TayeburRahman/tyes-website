-- Enable RLS (just to be safe)
ALTER TABLE brand_strategy_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own requests
CREATE POLICY "Users can view own strategy requests"
ON brand_strategy_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own requests
CREATE POLICY "Users can insert own strategy requests"
ON brand_strategy_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own requests (optional, but good)
CREATE POLICY "Users can update own strategy requests"
ON brand_strategy_requests
FOR UPDATE
USING (auth.uid() = user_id);

-- Notify postgrest to reload the schema
NOTIFY pgrst, 'reload schema';
