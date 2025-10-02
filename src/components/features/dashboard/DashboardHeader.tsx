'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { logout } from '@/app/actions/auth';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNav } from './MobileNav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardHeaderProps {
  role?: 'ADMIN' | 'WORKER';
}

export function DashboardHeader({ role }: DashboardHeaderProps = {}) {
  const { t } = useTranslation('dashboard');
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
  }

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container bg-white mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <MobileNav
            role={role}
            labels={{
              projects: t('projects'),
              reports: t('reports'),
            }}
          />
          <h1 className="text-xl font-semibold">{t('title')}</h1>

          {role === 'ADMIN' && (
            <nav className="hidden md:flex items-center gap-4 ml-6">
              <Link
                href="/admin"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/admin') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                {t('projects')}
              </Link>
              <Link
                href="/admin/reports"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/admin/reports') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
                {t('reports')}
              </Link>
            </nav>
          )}
        </div>

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
