import { requireAuth } from '@/lib/auth/session';
import { getUserWithRole } from '@/lib/user/getOrCreateUser';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AdminProjectsPage from './projects/page';
import { prisma } from '@/lib/prisma/client';
import { getServerLocale } from '@/lib/i18n/getServerLocale';
import { initServerI18n } from '@/i18n/server';

export default async function AdminDashboard() {
  const session = await requireAuth();
  const user = await getUserWithRole(session.user.id);

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const locale = await getServerLocale();
  const { t } = await initServerI18n(locale, 'dashboard');

  // Obtener estadísticas de la base de datos
  const [totalUsers, activeProjects, thisMonthHours, uniqueClients] = await Promise.all([
    prisma.user.count(),
    prisma.project.count({
      where: {
        status: 'ACTIVE',
      },
    }),
    prisma.timeEntry.aggregate({
      _sum: {
        duration: true,
      },
      where: {
        startTime: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        status: 'COMPLETED',
      },
    }),
    prisma.project.findMany({
      where: {
        clientEmail: {
          not: null,
        },
      },
      distinct: ['clientEmail'],
      select: {
        clientEmail: true,
      },
    }),
  ]);

  const totalHoursThisMonth = thisMonthHours._sum.duration
    ? Math.round(thisMonthHours._sum.duration / 60)
    : 0;

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {t('adminPanel')}
          </h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('totalUsers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">{t('registered')}</p>
            </CardContent>
          </Card>

          <Link href="/admin/projects">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{t('projects')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{activeProjects}</p>
                <p className="text-sm text-muted-foreground">{t('active')}</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>{t('totalHours')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalHoursThisMonth}h</p>
              <p className="text-sm text-muted-foreground">{t('thisMonth')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('clients')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{uniqueClients.length}</p>
              <p className="text-sm text-muted-foreground">{t('registered')}</p>
            </CardContent>
          </Card>
        </div>

        <AdminProjectsPage />
      </main>
    </div>
  );
}
