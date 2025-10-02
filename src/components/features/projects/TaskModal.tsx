'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { createTask } from '@/app/actions/projects';

interface TaskModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export function TaskModal({ projectId, projectName, onClose }: TaskModalProps) {
  const { t } = useTranslation('projects');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    await createTask(projectId, formData);

    setIsLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{t('addTask')}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {projectName}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('taskName')} *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Implementar funcionalidad..."
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="description">{t('taskDescription')}</Label>
              <textarea
                id="description"
                name="description"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Detalles de la tarea..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('common:loading') : t('addTask')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
