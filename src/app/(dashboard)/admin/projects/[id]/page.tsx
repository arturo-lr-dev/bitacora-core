import { requireAuth } from '@/lib/auth/session';
import { getUserWithRole } from '@/lib/user/getOrCreateUser';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { notFound } from 'next/navigation';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProjectDetailClient } from '@/components/features/projects/ProjectDetailClient';
import { ProjectDetailHeader } from '@/components/features/projects/ProjectDetailHeader';
import { WorkerAssignments } from '@/components/features/projects/WorkerAssignments';
import { getServerLocale } from '@/lib/i18n/getServerLocale';
import { initServerI18n } from '@/i18n/server';
import Link from 'next/link';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await requireAuth();
  const user = await getUserWithRole(session.user.id);

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const { id } = await params;
  const locale = await getServerLocale();
  const { t } = await initServerI18n(locale, 'projects');

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' }
        ]
      },
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          }
        }
      }
    }
  });

  if (!project) {
    notFound();
  }

  const activeTasks = project.tasks.filter(t => t.isActive).length;
  const completedTasks = project.tasks.filter(t => !t.isActive).length;

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    ON_HOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              ← {t('backToProjects')}
            </Button>
          </Link>

          <ProjectDetailHeader
            project={project}
            editLabel={t('editProject')}
            statusColors={statusColors}
            statusLabel={t(project.status.toLowerCase())}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('activeTasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeTasks}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('completedTasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completedTasks}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('totalTasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{project.tasks.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {project.clientName && (
            <Card>
              <CardHeader>
                <CardTitle>{t('clientInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">{t('clientName')}: </span>
                  <span className="font-medium">{project.clientName}</span>
                </div>
                {project.clientEmail && (
                  <div>
                    <span className="text-sm text-muted-foreground">{t('clientEmail')}: </span>
                    <span className="font-medium">{project.clientEmail}</span>
                  </div>
                )}
                {project.hourlyRate && (
                  <div>
                    <span className="text-sm text-muted-foreground">{t('hourlyRate')}: </span>
                    <span className="font-medium">€{project.hourlyRate}/h</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('workers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkerAssignments
                projectId={project.id}
                assignments={project.assignments}
                labels={{
                  workers: t('workers'),
                  assignWorker: t('assignWorker'),
                  selectWorker: t('selectWorker'),
                  searchWorkers: t('searchWorkers'),
                  noWorkersFound: t('noWorkersFound'),
                  workersSelected: t('workersSelected'),
                  remove: t('remove'),
                }}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('tasks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectDetailClient
              projectId={project.id}
              projectName={project.name}
              tasks={project.tasks}
              addTaskLabel={t('addTask')}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
