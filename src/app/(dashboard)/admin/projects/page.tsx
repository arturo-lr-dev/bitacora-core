'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProjectCard } from '@/components/features/projects/ProjectCard';
import { ProjectModal } from '@/components/features/projects/ProjectModal';
import { TaskModal } from '@/components/features/projects/TaskModal';
import { Project, Task, ProjectStatus } from '@prisma/client';

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

export default function AdminProjectsPage() {
  const { t } = useTranslation('projects');
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithTasks[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithTasks | undefined>();
  const [taskProjectId, setTaskProjectId] = useState<string>('');
  const [taskProjectName, setTaskProjectName] = useState<string>('');

  // Cargar proyectos
  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    }
    fetchProjects();
  }, []);

  // Filtrar proyectos
  useEffect(() => {
    let filtered = projects;

    // Filtro por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, statusFilter]);

  function handleEditProject(project: ProjectWithTasks) {
    setSelectedProject(project);
    setShowProjectModal(true);
  }

  function handleAddTask(projectId: string) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setTaskProjectId(projectId);
      setTaskProjectName(project.name);
      setShowTaskModal(true);
    }
  }

  function handleCloseModals() {
    setShowProjectModal(false);
    setShowTaskModal(false);
    setSelectedProject(undefined);
    setTaskProjectId('');
    setTaskProjectName('');
    // Recargar proyectos
    window.location.reload();
  }

  const statuses: (ProjectStatus | 'ALL')[] = ['ALL', 'ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED'];

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground mt-1">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto' : 'proyectos'}
              </p>
            </div>
            <Button onClick={() => setShowProjectModal(true)} className="w-full md:w-auto">
              + {t('newProject')}
            </Button>
          </div>

          {/* Filtros */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder={t('searchProjects')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'ALL')}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm md:w-48"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'ALL' ? t('allStatuses') : t(status.toLowerCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">{t('noProjects')}</h3>
            <p className="text-muted-foreground mb-6">{t('noProjectsDesc')}</p>
            <Button onClick={() => setShowProjectModal(true)}>
              + {t('newProject')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {showProjectModal && (
        <ProjectModal
          project={selectedProject}
          onClose={handleCloseModals}
        />
      )}

      {showTaskModal && (
        <TaskModal
          projectId={taskProjectId}
          projectName={taskProjectName}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
}
