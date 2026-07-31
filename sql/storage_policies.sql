-- Allow public access to read files in the 'pdfs' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'pdfs' );

-- Allow authenticated users to upload files to the 'pdfs' bucket
CREATE POLICY "Auth Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'pdfs' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update their files
CREATE POLICY "Auth Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'pdfs' AND auth.role() = 'authenticated' );
