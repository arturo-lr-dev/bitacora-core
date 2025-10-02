'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { createProject, updateProject } from '@/app/actions/projects';
import { Project, ProjectStatus } from '@prisma/client';

interface ProjectModalProps {
  project?: Project;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { t } = useTranslation('projects');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    if (project) {
      await updateProject(project.id, formData);
    } else {
      await createProject(formData);
    }

    setIsLoading(false);
    onClose();
  }

  const statuses: ProjectStatus[] = ['ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {project ? t('editProject') : t('newProject')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">{t('projectName')} *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={project?.name}
                  required
                  placeholder="Mi proyecto..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">{t('projectDescription')}</Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={project?.description || ''}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Descripción del proyecto..."
                />
              </div>

              {project && (
                <div>
                  <Label htmlFor="status">{t('status')}</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={project.status}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {t(status.toLowerCase())}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={project ? '' : 'md:col-span-2'}>
                <Label htmlFor="hourlyRate">{t('hourlyRate')}</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  step="0.01"
                  defaultValue={project?.hourlyRate || ''}
                  placeholder="25.00"
                />
              </div>

              <div>
                <Label htmlFor="clientName">{t('clientName')}</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  defaultValue={project?.clientName || ''}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">{t('clientEmail')}</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  defaultValue={project?.clientEmail || ''}
                  placeholder="cliente@email.com"
                />
              </div>
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
                {isLoading ? t('common:loading') : project ? t('saveChanges') : t('createProject')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
