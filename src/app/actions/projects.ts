'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import type { ActionResponse } from '@/lib/utils/actionResponse';
import { ProjectStatus, Role } from '@prisma/client';
import { requireAuth } from '@/lib/auth/session';
import { uploadTaskAttachment } from './attachments';

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

  // Upload files if any
  const files = formData.getAll('files') as File[];
  for (const file of files) {
    if (file && file.size > 0) {
      const fileFormData = new FormData();
      fileFormData.append('file', file);
      await uploadTaskAttachment(task.id, fileFormData);
    }
  }

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

export async function getWorkers() {
  const workers = await prisma.user.findMany({
    where: {
      role: Role.WORKER,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return workers;
}

export async function assignWorkerToProject(
  projectId: string,
  workerId: string
): Promise<ActionResponse<void>> {
  try {
    await prisma.projectAssignment.create({
      data: {
        projectId,
        userId: workerId,
      },
    });

    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, data: undefined };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'El worker ya está asignado a este proyecto' };
    }
    return { success: false, error: 'Error al asignar worker' };
  }
}

export async function removeWorkerFromProject(
  projectId: string,
  workerId: string
): Promise<ActionResponse<void>> {
  await prisma.projectAssignment.deleteMany({
    where: {
      projectId,
      userId: workerId,
    },
  });

  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true, data: undefined };
}
