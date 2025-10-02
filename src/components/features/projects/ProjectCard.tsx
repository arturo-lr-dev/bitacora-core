'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Project, Task } from '@prisma/client';
import { deleteProject } from '@/app/actions/projects';

interface Assignment {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface ProjectWithTasks extends Project {
  tasks: Task[];
  assignments: Assignment[];
}

interface ProjectCardProps {
  project: ProjectWithTasks;
  onEdit: (project: ProjectWithTasks) => void;
  onAddTask: (projectId: string) => void;
}

export function ProjectCard({ project, onEdit, onAddTask }: ProjectCardProps) {
  const { t } = useTranslation('projects');
  const [isDeleting, setIsDeleting] = useState(false);

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    ON_HOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  async function handleDelete() {
    if (!confirm(t('deleteConfirm'))) return;

    setIsDeleting(true);
    await deleteProject(project.id);
  }

  const activeTasks = project.tasks.filter(t => t.isActive).length;
  const totalTasks = project.tasks.length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                statusColors[project.status]
              }`}
            >
              {t(project.status.toLowerCase())}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
              className="h-8 w-8 p-0"
            >
              ✏️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 hover:text-destructive"
            >
              🗑️
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {project.clientName && (
          <div className="text-sm">
            <span className="text-muted-foreground">{t('client')}: </span>
            <span className="font-medium">{project.clientName}</span>
          </div>
        )}

        {project.hourlyRate && (
          <div className="text-sm">
            <span className="text-muted-foreground">{t('hourlyRate')}: </span>
            <span className="font-medium">€{project.hourlyRate}/h</span>
          </div>
        )}

        {project.assignments.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">{t('workers')}: </span>
            <span className="font-medium">
              {project.assignments.map(a => a.user.name || a.user.email).join(', ')}
            </span>
          </div>
        )}

        <div className="space-y-2 pt-3 border-t">
          <div className="text-sm">
            <span className="font-medium">{activeTasks}</span>
            <span className="text-muted-foreground"> / {totalTasks} {t('tasks')}</span>
          </div>
          <div className="flex gap-2">
            <a href={`/admin/projects/${project.id}`} className="flex-1">
              <Button
                variant="secondary"
                size="sm"
                className="w-full h-8 text-sm"
              >
                📋 {t('detail')}
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTask(project.id)}
              className="h-8 text-sm flex-1"
            >
              + {t('addTaskShort')}
            </Button>
          </div>
        </div>

        {project.tasks.length > 0 && (
          <div className="space-y-1 pt-2">
            {project.tasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50"
              >
                <span className={task.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}>
                  {task.isActive ? '□' : '✓'} {task.name}
                </span>
              </div>
            ))}
            {project.tasks.length > 3 && (
              <p className="text-xs text-muted-foreground pl-2">
                +{project.tasks.length - 3} {t('more')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
