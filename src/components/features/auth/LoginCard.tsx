'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoginForm } from './LoginForm';

export function LoginCard() {
  const { t } = useTranslation('auth');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('welcomeBack')}</CardTitle>
        <CardDescription>{t('login')}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
