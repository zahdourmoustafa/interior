-- Migration: Add Credit System
-- Date: 2025-07-26
-- Description: Add credit system fields to user table and create credit transactions table

-- Add credit fields to user table
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "credits_remaining" INTEGER DEFAULT 6 NOT NULL,
ADD COLUMN IF NOT EXISTS "credits_total" INTEGER DEFAULT 6 NOT NULL,
ADD COLUMN IF NOT EXISTS "subscription_status" TEXT DEFAULT 'free' NOT NULL,
ADD COLUMN IF NOT EXISTS "credits_granted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing users to have 6 credits
UPDATE "user" 
SET 
  "credits_remaining" = 6,
  "credits_total" = 6,
  "subscription_status" = 'free',
  "credits_granted_at" = CURRENT_TIMESTAMP
WHERE "credits_remaining" IS NULL;

-- Create credit transactions table
CREATE TABLE IF NOT EXISTS "credit_transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "feature_used" VARCHAR(20) NOT NULL,
  "credits_consumed" INTEGER DEFAULT 1 NOT NULL,
  "generation_id" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_credit_transactions_user_id" ON "credit_transactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_credit_transactions_created_at" ON "credit_transactions"("created_at");
CREATE INDEX IF NOT EXISTS "idx_credit_transactions_feature" ON "credit_transactions"("feature_used");

-- Add constraints
ALTER TABLE "user" 
ADD CONSTRAINT "check_credits_remaining_positive" CHECK ("credits_remaining" >= 0),
ADD CONSTRAINT "check_credits_total_positive" CHECK ("credits_total" >= 0),
ADD CONSTRAINT "check_subscription_status" CHECK ("subscription_status" IN ('free', 'basic', 'pro', 'expert'));

ALTER TABLE "credit_transactions"
ADD CONSTRAINT "check_credits_consumed_positive" CHECK ("credits_consumed" > 0),
ADD CONSTRAINT "check_feature_used_valid" CHECK ("feature_used" IN ('interior', 'exterior', 'sketch', 'furnish', 'remove', 'video'));
