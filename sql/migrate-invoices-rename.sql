-- Migration: Remove SmartBill columns from invoices table
-- Run this in: Supabase Dashboard → SQL Editor

-- Step 1: Rename smartbill_number to stripe_invoice_id
ALTER TABLE invoices RENAME COLUMN smartbill_number TO stripe_invoice_id;

-- Step 2: Drop the smartbill_series column (always was 'STRIPE', no longer needed)
ALTER TABLE invoices DROP COLUMN IF EXISTS smartbill_series;
