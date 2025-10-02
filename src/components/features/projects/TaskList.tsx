'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Task } from '@prisma/client';
import { deleteTask, toggleTaskStatus } from '@/app/actions/projects';

interface TaskListProps {
  tasks: Task[];
  onRefresh: () => void;
}

export function TaskList({ tasks, onRefresh }: TaskListProps) {
  const { t } = useTranslation('projects');
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  async function handleToggle(taskId: string) {
    setLoadingTaskId(taskId);
    await toggleTaskStatus(taskId);
    setLoadingTaskId(null);
    onRefresh();
  }

  async function handleDelete(taskId: string, taskName: string) {
    if (!confirm(`${t('deleteTaskConfirm')}\n\n"${taskName}"`)) return;

    setLoadingTaskId(taskId);
    await deleteTask(taskId);
    setLoadingTaskId(null);
    onRefresh();
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-2">📝</div>
        <p>{t('noTasks')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div
          key={task.id}
          className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
        >
          <button
            onClick={() => handleToggle(task.id)}
            disabled={loadingTaskId === task.id}
            className="mt-1 flex-shrink-0 w-5 h-5 rounded border-2 border-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
          >
            {task.isActive ? null : <span className="text-xs">✓</span>}
          </button>

          <div className="flex-1 min-w-0">
            <p
              className={`font-medium ${
                task.isActive ? 'text-foreground' : 'text-muted-foreground line-through'
              }`}
            >
              {task.name}
            </p>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {task.description}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(task.id, task.name)}
            disabled={loadingTaskId === task.id}
            className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            🗑️
          </Button>
        </div>
      ))}
    </div>
  );
}
