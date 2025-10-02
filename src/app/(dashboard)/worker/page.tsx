import { requireAuth } from '@/lib/auth/session';
import { getUserWithRole } from '@/lib/user/getOrCreateUser';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function WorkerDashboard() {
  const session = await requireAuth();
  const user = await getUserWithRole(session.user.id);

  if (!user || user.role !== 'WORKER') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Panel de Trabajador
          </h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Proyectos Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Proyectos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horas Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0h</p>
              <p className="text-sm text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Por completar</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
