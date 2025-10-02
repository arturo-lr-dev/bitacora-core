'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import type { ActionResponse } from '@/lib/utils/actionResponse';
import { requireAuth } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { getServerLocale } from '@/lib/i18n/getServerLocale';
import { initServerI18n } from '@/i18n/server';

const BUCKET_NAME = 'task-attachments';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadTaskAttachment(
  taskId: string,
  formData: FormData
): Promise<ActionResponse<{ id: string }>> {
  const locale = await getServerLocale();
  const i18n = await initServerI18n(locale, 'projects');
  const t = i18n.t.bind(i18n);

  const session = await requireAuth();
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: t('errors.noFileProvided') };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: t('errors.fileTooLarge') };
  }

  // Validar que la tarea existe
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return { success: false, error: t('errors.taskNotFound') };
  }

  try {
    const supabase = await createClient();

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${taskId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { success: false, error: t('errors.uploadError') };
    }

    // Guardar metadata en la base de datos
    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: uploadData.path,
        uploadedById: session.user.id,
      },
    });

    revalidatePath('/admin/projects');
    return { success: true, data: { id: attachment.id } };
  } catch (error) {
    console.error('Error in uploadTaskAttachment:', error);
    return { success: false, error: t('errors.processError') };
  }
}

export async function deleteTaskAttachment(
  attachmentId: string
): Promise<ActionResponse<void>> {
  const locale = await getServerLocale();
  const i18n = await initServerI18n(locale, 'projects');
  const t = i18n.t.bind(i18n);

  await requireAuth();

  const attachment = await prisma.taskAttachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) {
    return { success: false, error: t('errors.fileNotFound') };
  }

  try {
    const supabase = await createClient();

    // Eliminar archivo de Storage
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([attachment.storagePath]);

    if (deleteError) {
      console.error('Error deleting file from storage:', deleteError);
    }

    // Eliminar registro de la base de datos
    await prisma.taskAttachment.delete({
      where: { id: attachmentId },
    });

    revalidatePath('/admin/projects');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error in deleteTaskAttachment:', error);
    return { success: false, error: t('errors.deleteError') };
  }
}

export async function getAttachmentUrl(storagePath: string): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
}
