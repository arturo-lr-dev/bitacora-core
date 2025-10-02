'use server';

import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/session';
import { getUserWithRole } from '@/lib/user/getOrCreateUser';
import { redirect } from 'next/navigation';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  projectId?: string;
  userId?: string;
  taskId?: string;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface TimeEntryReport {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  status: string;
  notes: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  project: {
    id: string;
    name: string;
    clientName: string | null;
    hourlyRate: number | null;
  };
  task: {
    id: string;
    name: string;
  };
}

export async function getReportData(filters: ReportFilters = {}) {
  const session = await requireAuth();
  const user = await getUserWithRole(session.user.id);

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const where: any = {};

  // Filtro por rango de fechas
  if (filters.startDate || filters.endDate) {
    where.startTime = {};
    if (filters.startDate) {
      where.startTime.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.startTime.lte = endDate;
    }
  }

  // Filtro por proyecto
  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  // Filtro por usuario
  if (filters.userId) {
    where.userId = filters.userId;
  }

  // Filtro por tarea
  if (filters.taskId) {
    where.taskId = filters.taskId;
  }

  // Filtro por estado
  if (filters.status) {
    where.status = filters.status;
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          clientName: true,
          hourlyRate: true,
        },
      },
      task: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startTime: 'desc',
    },
  });

  return entries;
}

export async function getReportSummary(filters: ReportFilters = {}) {
  const entries = await getReportData(filters);

  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const totalHours = totalMinutes / 60;

  // Agrupar por usuario
  const byUser = entries.reduce((acc, entry) => {
    const userId = entry.user.id;
    if (!acc[userId]) {
      acc[userId] = {
        user: entry.user,
        totalMinutes: 0,
        entriesCount: 0,
      };
    }
    acc[userId].totalMinutes += entry.duration || 0;
    acc[userId].entriesCount += 1;
    return acc;
  }, {} as Record<string, { user: any; totalMinutes: number; entriesCount: number }>);

  // Agrupar por proyecto
  const byProject = entries.reduce((acc, entry) => {
    const projectId = entry.project.id;
    if (!acc[projectId]) {
      acc[projectId] = {
        project: entry.project,
        totalMinutes: 0,
        entriesCount: 0,
        estimatedCost: 0,
      };
    }
    acc[projectId].totalMinutes += entry.duration || 0;
    acc[projectId].entriesCount += 1;

    // Calcular costo estimado si hay tarifa
    if (entry.project.hourlyRate && entry.duration) {
      acc[projectId].estimatedCost += (entry.duration / 60) * entry.project.hourlyRate;
    }

    return acc;
  }, {} as Record<string, { project: any; totalMinutes: number; entriesCount: number; estimatedCost: number }>);

  return {
    totalEntries: entries.length,
    totalHours,
    totalMinutes,
    byUser: Object.values(byUser),
    byProject: Object.values(byProject),
  };
}

export async function getReportFiltersData() {
  const session = await requireAuth();
  const user = await getUserWithRole(session.user.id);

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const [projects, users, tasks] = await Promise.all([
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.user.findMany({
      where: {
        role: 'WORKER',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.task.findMany({
      select: {
        id: true,
        name: true,
        projectId: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  return { projects, users, tasks };
}
