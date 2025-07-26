-- Migration: Add Text to Design Feature
-- Date: 2025-07-26
-- Description: Add 'text' feature to credit transactions constraints

-- Drop the existing constraint
ALTER TABLE "credit_transactions" DROP CONSTRAINT IF EXISTS "check_feature_used_valid";

-- Add the updated constraint with 'text' feature
ALTER TABLE "credit_transactions"
ADD CONSTRAINT "check_feature_used_valid" CHECK ("feature_used" IN ('interior', 'exterior', 'sketch', 'furnish', 'remove', 'video', 'text'));
