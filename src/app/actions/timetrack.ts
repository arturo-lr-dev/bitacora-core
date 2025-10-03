'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import type { ActionResponse } from '@/lib/utils/actionResponse';
import { requireAuth } from '@/lib/auth/session';

export async function startTimeEntry(
  projectId: string,
  taskId: string,
  notes?: string
): Promise<ActionResponse<{ id: string }>> {
  const session = await requireAuth();

  // Verificar si ya hay una entrada activa
  const activeEntry = await prisma.timeEntry.findFirst({
    where: {
      userId: session.user.id,
      status: 'IN_PROGRESS',
    },
  });

  if (activeEntry) {
    return { success: false, error: 'Ya tienes un registro activo. Deténlo antes de iniciar uno nuevo.' };
  }

  const entry = await prisma.timeEntry.create({
    data: {
      userId: session.user.id,
      projectId,
      taskId,
      notes: notes || null,
      status: 'IN_PROGRESS',
      startTime: new Date(),
    },
  });

  revalidatePath('/worker');
  return { success: true, data: { id: entry.id } };
}

export async function stopTimeEntry(entryId: string): Promise<ActionResponse<void>> {
  const session = await requireAuth();
  const now = new Date();

  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    return { success: false, error: 'Registro no encontrado' };
  }

  if (entry.userId !== session.user.id) {
    return { success: false, error: 'No autorizado' };
  }

  if (entry.status !== 'IN_PROGRESS') {
    return { success: false, error: 'Este registro ya fue detenido' };
  }

  // Calcular duración en minutos
  const durationMs = now.getTime() - entry.startTime.getTime();
  const durationMinutes = Math.round(durationMs / 60000);

  await prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      endTime: now,
      duration: durationMinutes,
      status: 'COMPLETED',
    },
  });

  revalidatePath('/worker');
  return { success: true, data: undefined };
}

export async function getActiveTimeEntry() {
  const session = await requireAuth();

  const entry = await prisma.timeEntry.findFirst({
    where: {
      userId: session.user.id,
      status: 'IN_PROGRESS',
    },
    include: {
      project: true,
      task: true,
    },
  });

  return entry;
}

export async function getWorkerProjects() {
  const session = await requireAuth();

  const assignments = await prisma.projectAssignment.findMany({
    where: {
      userId: session.user.id,
      project: {
        status: 'ACTIVE',
      },
    },
    include: {
      project: {
        include: {
          tasks: {
            where: {
              isActive: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
  });

  return assignments.map(a => a.project);
}

export async function getTimeEntries(filter: 'today' | 'week' | 'month' = 'today') {
  const session = await requireAuth();
  const now = new Date();
  let startDate: Date;

  switch (filter) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lunes como primer día
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: session.user.id,
      startTime: {
        gte: startDate,
      },
    },
    include: {
      project: true,
      task: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  });

  return entries;
}

export async function updateStartTime(
  entryId: string,
  newStartTime: Date
): Promise<ActionResponse<void>> {
  const session = await requireAuth();

  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    return { success: false, error: 'Registro no encontrado' };
  }

  if (entry.userId !== session.user.id) {
    return { success: false, error: 'No autorizado' };
  }

  if (entry.status !== 'IN_PROGRESS') {
    return { success: false, error: 'Solo se puede ajustar el tiempo de registros activos' };
  }

  // Validar que la nueva hora no sea futura
  if (newStartTime.getTime() > new Date().getTime()) {
    return { success: false, error: 'La hora de inicio no puede ser futura' };
  }

  await prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      startTime: newStartTime,
    },
  });

  revalidatePath('/worker');
  return { success: true, data: undefined };
}
