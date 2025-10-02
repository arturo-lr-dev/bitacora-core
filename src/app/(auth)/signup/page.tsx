import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerLocale } from '@/lib/i18n/getServerLocale';
import { initServerI18n } from '@/i18n/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SignupForm } from '@/components/features/auth/SignupForm';

export default async function SignupPage() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  const locale = await getServerLocale();
  const { t } = await initServerI18n(locale, 'auth');

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('createAccount')}</CardTitle>
          <CardDescription>{t('signupDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
