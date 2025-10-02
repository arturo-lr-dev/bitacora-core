'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ReportFilters } from '@/app/actions/reports';

interface ReportFiltersProps {
  projects: { id: string; name: string }[];
  users: { id: string; name: string | null; email: string }[];
  tasks: { id: string; name: string; projectId: string }[];
  onFilterChange: (filters: ReportFilters) => void;
  labels: {
    filters: string;
    startDate: string;
    endDate: string;
    project: string;
    user: string;
    task: string;
    status: string;
    allProjects: string;
    allUsers: string;
    allTasks: string;
    allStatuses: string;
    inProgress: string;
    completed: string;
    cancelled: string;
    applyFilters: string;
    clearFilters: string;
  };
}

export function ReportFilters({
  projects,
  users,
  tasks,
  onFilterChange,
  labels,
}: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportFilters>({});

  const selectedProjectTasks = filters.projectId
    ? tasks.filter(t => t.projectId === filters.projectId)
    : tasks;

  function handleFilterChange(key: keyof ReportFilters, value: string) {
    const newFilters = { ...filters, [key]: value || undefined };

    // Si cambia el proyecto, limpiar la tarea seleccionada
    if (key === 'projectId') {
      newFilters.taskId = undefined;
    }

    setFilters(newFilters);
  }

  function handleApply() {
    onFilterChange(filters);
  }

  function handleClear() {
    setFilters({});
    onFilterChange({});
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.filters}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Fecha Inicio */}
          <div>
            <Label htmlFor="startDate">{labels.startDate}</Label>
            <input
              id="startDate"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <Label htmlFor="endDate">{labels.endDate}</Label>
            <input
              id="endDate"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Proyecto */}
          <div>
            <Label htmlFor="project">{labels.project}</Label>
            <select
              id="project"
              value={filters.projectId || ''}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{labels.allProjects}</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Usuario */}
          <div>
            <Label htmlFor="user">{labels.user}</Label>
            <select
              id="user"
              value={filters.userId || ''}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{labels.allUsers}</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Tarea */}
          <div>
            <Label htmlFor="task">{labels.task}</Label>
            <select
              id="task"
              value={filters.taskId || ''}
              onChange={(e) => handleFilterChange('taskId', e.target.value)}
              disabled={!filters.projectId && tasks.length > 50}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">{labels.allTasks}</option>
              {selectedProjectTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <Label htmlFor="status">{labels.status}</Label>
            <select
              id="status"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as any)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{labels.allStatuses}</option>
              <option value="IN_PROGRESS">{labels.inProgress}</option>
              <option value="COMPLETED">{labels.completed}</option>
              <option value="CANCELLED">{labels.cancelled}</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleApply} className="flex-1">
            {labels.applyFilters}
          </Button>
          <Button onClick={handleClear} variant="secondary" className="flex-1">
            {labels.clearFilters}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
