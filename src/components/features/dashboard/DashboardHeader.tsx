'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { logout } from '@/app/actions/auth';
import { LanguageSwitcher } from './LanguageSwitcher';

export function DashboardHeader() {
  const { t } = useTranslation('dashboard');

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-9 w-9 p-0"
            title={t('logout')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
}
