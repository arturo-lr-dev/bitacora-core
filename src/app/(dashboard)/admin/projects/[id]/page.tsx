import { requireAuth } from '@/lib/auth/session';
import { getUserWithRole } from '@/lib/user/getOrCreateUser';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { notFound } from 'next/navigation';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProjectDetailClient } from '@/components/features/projects/ProjectDetailClient';
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
          <Link href="/admin/projects">
            <Button variant="ghost" size="sm" className="mb-4">
              ← {t('backToProjects')}
            </Button>
          </Link>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  statusColors[project.status]
                }`}
              >
                {t(project.status.toLowerCase())}
              </span>
            </div>
          </div>

          {project.description && (
            <p className="text-muted-foreground mt-4">{project.description}</p>
          )}
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

        {project.clientName && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('clientInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>
        )}

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
