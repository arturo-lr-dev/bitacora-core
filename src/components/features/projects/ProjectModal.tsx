'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { createProject, updateProject, getWorkers, assignWorkerToProject, removeWorkerFromProject } from '@/app/actions/projects';
import { Project, ProjectStatus } from '@prisma/client';

interface Worker {
  id: string;
  email: string;
  name: string | null;
}

interface Assignment {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface ProjectWithAssignments extends Project {
  assignments?: Assignment[];
}

interface ProjectModalProps {
  project?: ProjectWithAssignments;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { t } = useTranslation('projects');
  const [isLoading, setIsLoading] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadWorkers() {
      const workersData = await getWorkers();
      setWorkers(workersData);
    }
    loadWorkers();
  }, []);

  useEffect(() => {
    if (project?.assignments) {
      setSelectedWorkerIds(project.assignments.map(a => a.user.id));
    }
  }, [project]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    let projectId: string;
    if (project) {
      await updateProject(project.id, formData);
      projectId = project.id;

      // Sincronizar asignaciones de workers
      const currentWorkerIds = project.assignments?.map(a => a.user.id) || [];

      // Agregar nuevos workers
      const workersToAdd = selectedWorkerIds.filter(id => !currentWorkerIds.includes(id));
      for (const workerId of workersToAdd) {
        await assignWorkerToProject(projectId, workerId);
      }

      // Eliminar workers deseleccionados
      const workersToRemove = currentWorkerIds.filter(id => !selectedWorkerIds.includes(id));
      for (const workerId of workersToRemove) {
        await removeWorkerFromProject(projectId, workerId);
      }
    } else {
      const result = await createProject(formData);
      if (result.success) {
        projectId = result.data.id;

        // Asignar workers seleccionados al nuevo proyecto
        for (const workerId of selectedWorkerIds) {
          await assignWorkerToProject(projectId, workerId);
        }
      }
    }

    setIsLoading(false);
    onClose();
  }

  function toggleWorker(workerId: string) {
    setSelectedWorkerIds(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  }

  const filteredWorkers = workers.filter(worker => {
    const searchLower = searchQuery.toLowerCase();
    return (
      worker.name?.toLowerCase().includes(searchLower) ||
      worker.email.toLowerCase().includes(searchLower)
    );
  });

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

              {workers.length > 0 && (
                <div className="md:col-span-2">
                  <Label>{t('assignWorkers')}</Label>
                  <div className="mt-2">
                    <Input
                      type="text"
                      placeholder={t('searchWorkers')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {filteredWorkers.length > 0 ? (
                        filteredWorkers.map(worker => (
                          <label
                            key={worker.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedWorkerIds.includes(worker.id)}
                              onChange={() => toggleWorker(worker.id)}
                              className="w-4 h-4 rounded border-input"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                {worker.name || worker.email}
                              </span>
                              {worker.name && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  {worker.email}
                                </span>
                              )}
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {t('noWorkersFound')}
                        </p>
                      )}
                    </div>
                    {selectedWorkerIds.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedWorkerIds.length} {t('workersSelected')}
                      </p>
                    )}
                  </div>
                </div>
              )}
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
