-- scripts/005_role_based_access.sql
-- Create a profiles table for role management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Update leads table to ensure 'Toplantı Planlandı' status exists
-- (Already might have Demo Planlandı, but we'll align with prompt)
-- Renaming 'Demo Planlandı' to 'Toplantı Planlandı' or adding it.
-- Let's check statusConfig in frontend later.

-- Add a column to track who is currently assigned (already exists: assigned_to)
-- The prompt says: Set 'assigned_to' = 'Admin'
-- To support this, we'll allow 'ADMIN' as a valid value for assigned_to or use it as a keyword.
