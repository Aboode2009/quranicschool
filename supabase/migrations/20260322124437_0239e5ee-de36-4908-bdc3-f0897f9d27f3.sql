
-- Add avatar_url column to people table
ALTER TABLE public.people ADD COLUMN avatar_url text;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Allow anyone to upload to avatars bucket
CREATE POLICY "Anyone can upload avatars" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- Allow anyone to update avatars
CREATE POLICY "Anyone can update avatars" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'avatars');

-- Allow anyone to delete avatars
CREATE POLICY "Anyone can delete avatars" ON storage.objects FOR DELETE TO public USING (bucket_id = 'avatars');
