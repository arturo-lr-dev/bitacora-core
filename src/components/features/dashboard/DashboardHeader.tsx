'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { logout } from '@/app/actions/auth';

export function DashboardHeader() {
  const { t } = useTranslation('dashboard');

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <Button variant="ghost" onClick={handleLogout}>
          {t('logout')}
        </Button>
      </div>
    </header>
  );
}
