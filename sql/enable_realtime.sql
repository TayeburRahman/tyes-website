-- Run this in Supabase Dashboard > SQL Editor
-- to enable Realtime for the orders table

-- 1. Enable full replica identity so Realtime can track all row changes (including old values)
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- 2. Add orders table to the Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
