'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SignupForm } from './SignupForm';

export function SignupCard() {
  const { t } = useTranslation('auth');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('createAccount')}</CardTitle>
        <CardDescription>{t('signupDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
