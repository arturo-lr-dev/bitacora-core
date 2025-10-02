import { requireAuth } from '@/lib/auth/session';
import { getUserWithRole } from '@/lib/user/getOrCreateUser';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { getActiveTimeEntry, getWorkerProjects, getTimeEntries } from '@/app/actions/timetrack';
import { ActiveTimer } from '@/components/features/timetrack/ActiveTimer';
import { StartTimeEntry } from '@/components/features/timetrack/StartTimeEntry';
import { TimeEntryHistory } from '@/components/features/timetrack/TimeEntryHistory';
import { TaskFileUpload } from '@/components/features/worker/TaskFileUpload';
import { getServerLocale } from '@/lib/i18n/getServerLocale';
import { initServerI18n } from '@/i18n/server';

export default async function WorkerDashboard() {
  const session = await requireAuth();
  const user = await getUserWithRole(session.user.id);

  if (!user || user.role !== 'WORKER') {
    redirect('/login');
  }

  const locale = await getServerLocale();
  const { t } = await initServerI18n(locale, 'timetrack');

  const [activeEntry, projects, todayEntries] = await Promise.all([
    getActiveTimeEntry(),
    getWorkerProjects(),
    getTimeEntries('today'),
  ]);

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
          <div className="space-y-6">
            {activeEntry ? (
              <ActiveTimer
                entryId={activeEntry.id}
                projectName={activeEntry.project.name}
                taskName={activeEntry.task.name}
                startTime={activeEntry.startTime}
                notes={activeEntry.notes}
                labels={{
                  activeEntry: t('activeEntry'),
                  workingOn: t('workingOn'),
                  duration: t('duration'),
                  notes: t('notes'),
                  stopWork: t('stopWork'),
                  adjustTime: t('adjustTime'),
                  adjustStartTime: t('adjustStartTime'),
                  save: t('save'),
                  cancel: t('cancel'),
                }}
              />
            ) : (
              <StartTimeEntry
                projects={projects}
                labels={{
                  startWork: t('startWork'),
                  project: t('project'),
                  selectTask: t('selectTask'),
                  addNotes: t('addNotes'),
                }}
              />
            )}

            <TaskFileUpload
              projects={projects}
              labels={{
                title: t('uploadFilesTitle'),
                selectProject: t('selectProject'),
                selectTask: t('selectTask'),
                selectFiles: t('selectFiles'),
                upload: t('upload'),
                uploadSuccess: t('uploadSuccess'),
                uploadError: t('uploadError'),
                maxFileSize: t('maxFileSize'),
              }}
            />
          </div>

          <div className="lg:col-span-2">
            <TimeEntryHistory
              entries={todayEntries}
              labels={{
                history: t('history') + ' - ' + t('today'),
                today: t('today'),
                thisWeek: t('thisWeek'),
                thisMonth: t('thisMonth'),
                totalHours: t('totalHours'),
                noEntries: t('noEntries'),
                hours: t('hours'),
                minutes: t('minutes'),
                startTime: t('startTime'),
                endTime: t('endTime'),
                project: t('project'),
                task: t('task'),
                notes: t('notes'),
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
