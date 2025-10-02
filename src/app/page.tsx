import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getUserWithRole } from '@/lib/user/getOrCreateUser';

export default async function Home() {
  const session = await getSession();

  if (session) {
    const user = await getUserWithRole(session.user.id);

    if (user) {
      const dashboardPath = user.role === 'ADMIN' ? '/admin' :
                            user.role === 'CLIENT' ? '/client' : '/worker';
      redirect(dashboardPath);
    } else {
      redirect('/worker'); // Default if user not found in Prisma
    }
  } else {
    redirect('/login');
  }
}
