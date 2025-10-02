import { requireAuth } from '@/lib/auth/session';
import { getUserWithRole } from '@/lib/user/getOrCreateUser';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { ReportsClient } from '@/components/features/reports/ReportsClient';
import { getReportFiltersData } from '@/app/actions/reports';
import { getServerLocale } from '@/lib/i18n/getServerLocale';
import { initServerI18n } from '@/i18n/server';

export default async function ReportsPage() {
  const session = await requireAuth();
  const user = await getUserWithRole(session.user.id);

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const locale = await getServerLocale();
  const i18n = await initServerI18n(locale, 'reports');
  const t = i18n.t.bind(i18n);

  const { projects, users, tasks } = await getReportFiltersData();

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader role="ADMIN" />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>

        <ReportsClient
          projects={projects}
          users={users}
          tasks={tasks}
          labels={{
            filters: t('filters'),
            startDate: t('startDate'),
            endDate: t('endDate'),
            project: t('project'),
            user: t('user'),
            task: t('task'),
            status: t('status'),
            allProjects: t('allProjects'),
            allUsers: t('allUsers'),
            allTasks: t('allTasks'),
            allStatuses: t('allStatuses'),
            inProgress: t('inProgress'),
            completed: t('completed'),
            cancelled: t('cancelled'),
            applyFilters: t('applyFilters'),
            clearFilters: t('clearFilters'),
            summary: t('summary'),
            totalEntries: t('totalEntries'),
            totalHours: t('totalHours'),
            byUser: t('byUser'),
            byProject: t('byProject'),
            entries: t('entries'),
            hours: t('hours'),
            estimatedCost: t('estimatedCost'),
            details: t('details'),
            date: t('date'),
            startTime: t('startTime'),
            endTime: t('endTime'),
            duration: t('duration'),
            worker: t('worker'),
            notes: t('notes'),
            noResults: t('noResults'),
            noResultsDesc: t('noResultsDesc'),
            exportCSV: t('exportCSV'),
            loading: t('loading'),
            minutes: t('minutes'),
          }}
        />
      </main>
    </div>
  );
}
