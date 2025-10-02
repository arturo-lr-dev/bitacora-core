import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { SignupCard } from '@/components/features/auth/SignupCard';

export default async function SignupPage() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <SignupCard />
    </div>
  );
}
