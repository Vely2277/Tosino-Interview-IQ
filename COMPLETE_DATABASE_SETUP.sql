-- COMPLETE DATABASE SETUP FOR INTERVIEWIQ APPLICATION
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- =====================================================
-- 1. AUTHENTICATION & USER TABLES
-- =====================================================

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INTERVIEW SESSION TABLES
-- =====================================================

-- Create sessions table for interview sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT,
  mode TEXT CHECK (mode IN ('text', 'voice')) DEFAULT 'text',
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in milliseconds
  summary TEXT,
  score INTEGER,
  questions_answered INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for storing interview conversation
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('assistant', 'user')) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. USER PROGRESS TRACKING
-- =====================================================

-- Create user_progress table for tracking user interview progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  last_session_date TIMESTAMP WITH TIME ZONE,
  improvement_trend TEXT CHECK (improvement_trend IN ('positive', 'negative', 'stable')) DEFAULT 'stable',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. JOB HISTORY TRACKING
-- =====================================================

-- Create job_history table for tracking job titles practiced
CREATE TABLE IF NOT EXISTS public.job_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT,
  sessions_count INTEGER DEFAULT 1,
  last_session TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  average_score DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_title, company)
);

-- =====================================================
-- 5. CV PROCESSING TABLES
-- =====================================================

-- Create cv_processing table for CV optimization features
CREATE TABLE IF NOT EXISTS public.cv_processing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  optimized_content TEXT,
  suggestions TEXT[], -- Array of suggestions
  processing_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_size INTEGER,
  file_type TEXT,
  file_name TEXT,
  optimization_score INTEGER CHECK (optimization_score >= 0 AND optimization_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_job_history_user_id ON public.job_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_processing_user_id ON public.cv_processing(user_id);

-- =====================================================
-- 7. TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update user profile when auth data changes
CREATE OR REPLACE FUNCTION public.update_user_profile()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users
  SET 
    email = new.email,
    full_name = new.raw_user_meta_data->>'full_name',
    avatar_url = new.raw_user_meta_data->>'avatar_url',
    updated_at = NOW()
  WHERE id = new.id;
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to update user profile on auth user update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_profile();

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_job_history_updated_at BEFORE UPDATE ON public.job_history
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_cv_processing_updated_at BEFORE UPDATE ON public.cv_processing
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_processing ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. SECURITY POLICIES
-- =====================================================

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Sessions table policies
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Messages table policies
CREATE POLICY "Users can view messages from own sessions" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- User progress table policies
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Job history table policies
CREATE POLICY "Users can view own job history" ON public.job_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own job history" ON public.job_history
  FOR ALL USING (auth.uid() = user_id);

-- CV processing table policies
CREATE POLICY "Users can view own CV data" ON public.cv_processing
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own CV data" ON public.cv_processing
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 10. PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.sessions TO anon, authenticated;
GRANT ALL ON public.messages TO anon, authenticated;
GRANT ALL ON public.user_progress TO anon, authenticated;
GRANT ALL ON public.job_history TO anon, authenticated;
GRANT ALL ON public.cv_processing TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- 11. SETUP COMPLETE
-- =====================================================

-- Insert a test user for development (optional - remove in production)
-- This creates a fallback user for testing purposes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'test@example.com') THEN
    INSERT INTO public.users (id, email, full_name)
    VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'Test User');
  END IF;
END $$;

-- =====================================================
-- SETUP COMPLETE! 
-- Your InterviewIQ database is now ready.
-- =====================================================
