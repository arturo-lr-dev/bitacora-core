import { requireAuth } from '@/lib/auth/session';
import { getServerLocale } from '@/lib/i18n/getServerLocale';
import { initServerI18n } from '@/i18n/server';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function DashboardPage() {
  const session = await requireAuth();
  const locale = await getServerLocale();
  const { t } = await initServerI18n(locale, 'dashboard');

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {t('welcome')}, {session.user.email}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contenido del dashboard
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
