
-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supervisor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'province_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'course_director';
