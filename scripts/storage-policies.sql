-- Políticas RLS para Supabase Storage - Bucket: task-attachments
-- Ejecutar en: Supabase Dashboard > SQL Editor

-- 1. Permitir lectura pública de archivos
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-attachments');

-- 2. Permitir subida de archivos a usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-attachments');

-- 3. Permitir actualización de archivos a usuarios autenticados
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'task-attachments');

-- 4. Permitir eliminación de archivos a usuarios autenticados
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task-attachments');
