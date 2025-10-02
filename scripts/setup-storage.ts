/**
 * Script para configurar Supabase Storage
 *
 * Este script crea el bucket necesario para almacenar archivos adjuntos de tareas.
 *
 * Ejecutar: npx tsx scripts/setup-storage.ts
 */

import { createClient } from '@supabase/supabase-js';
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🚀 Configurando Supabase Storage...\n');

  // Crear bucket para archivos adjuntos de tareas
  const { error: bucketError } = await supabase.storage.createBucket('task-attachments', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
  });

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log('✅ El bucket "task-attachments" ya existe');
    } else {
      console.error('❌ Error creando bucket:', bucketError.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Bucket "task-attachments" creado exitosamente');
  }

  console.log('\n✨ Configuración completada!\n');
  console.log('📋 Instrucciones adicionales:');
  console.log('1. Verifica que SUPABASE_SERVICE_ROLE_KEY esté configurada en .env');
  console.log('2. El bucket "task-attachments" está configurado como público');
  console.log('3. Límite de tamaño: 10MB por archivo\n');
}

setupStorage().catch(console.error);
