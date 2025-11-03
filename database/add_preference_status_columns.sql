-- Add preference status tracking columns to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferences_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferences_skipped_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_preferences_status 
ON users(preferences_completed, preferences_skipped_at);

-- Update existing users who have interview_date and interview_frequency as completed
UPDATE users 
SET preferences_completed = TRUE 
WHERE interview_date IS NOT NULL AND interview_frequency IS NOT NULL;