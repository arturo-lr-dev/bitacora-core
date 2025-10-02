'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import type { ActionResponse } from '@/lib/utils/actionResponse';
import { ProjectStatus } from '@prisma/client';

export async function createProject(formData: FormData): Promise<ActionResponse<{ id: string }>> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const clientName = formData.get('clientName') as string;
  const clientEmail = formData.get('clientEmail') as string;
  const hourlyRateStr = formData.get('hourlyRate') as string;

  if (!name) {
    return { success: false, error: 'El nombre es requerido' };
  }

  const hourlyRate = hourlyRateStr ? parseFloat(hourlyRateStr) : null;

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      clientName: clientName || null,
      clientEmail: clientEmail || null,
      hourlyRate,
      status: 'ACTIVE',
    },
  });

  revalidatePath('/admin/projects');
  return { success: true, data: { id: project.id } };
}

export async function updateProject(
  projectId: string,
  formData: FormData
): Promise<ActionResponse<void>> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as ProjectStatus;
  const clientName = formData.get('clientName') as string;
  const clientEmail = formData.get('clientEmail') as string;
  const hourlyRateStr = formData.get('hourlyRate') as string;

  const hourlyRate = hourlyRateStr ? parseFloat(hourlyRateStr) : null;

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      description: description || null,
      status,
      clientName: clientName || null,
      clientEmail: clientEmail || null,
      hourlyRate,
    },
  });

  revalidatePath('/admin/projects');
  return { success: true, data: undefined };
}

export async function deleteProject(projectId: string): Promise<ActionResponse<void>> {
  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath('/admin/projects');
  return { success: true, data: undefined };
}

export async function createTask(
  projectId: string,
  formData: FormData
): Promise<ActionResponse<{ id: string }>> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    return { success: false, error: 'El nombre es requerido' };
  }

  const task = await prisma.task.create({
    data: {
      name,
      description: description || null,
      projectId,
      isActive: true,
    },
  });

  revalidatePath('/admin/projects');
  return { success: true, data: { id: task.id } };
}

export async function deleteTask(taskId: string): Promise<ActionResponse<void>> {
  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath('/admin/projects');
  return { success: true, data: undefined };
}

export async function toggleTaskStatus(taskId: string): Promise<ActionResponse<void>> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return { success: false, error: 'Tarea no encontrada' };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { isActive: !task.isActive },
  });

  revalidatePath('/admin/projects');
  return { success: true, data: undefined };
}
