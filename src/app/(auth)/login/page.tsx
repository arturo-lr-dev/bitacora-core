import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { LoginCard } from '@/components/features/auth/LoginCard';

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <LoginCard />
    </div>
  );
}
