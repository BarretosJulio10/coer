-- Create bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to read photos
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- Policy to allow anonymous/public users to upload photos (since form is public)
CREATE POLICY "Public Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');
