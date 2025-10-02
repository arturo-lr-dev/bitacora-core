'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { signup } from '@/app/actions/auth';
import { OAuthButtons } from './OAuthButtons';

export function SignupForm() {
  const { t } = useTranslation(['auth', 'validation']);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await signup(formData);

    if (result.success) {
      router.push(result.data.redirectTo);
      router.refresh();
    } else {
      setError(t(result.error));
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth:email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t('auth:emailPlaceholder')}
            required
            disabled={isLoading}
            error={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth:password')}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={t('auth:passwordPlaceholder')}
            required
            disabled={isLoading}
            error={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('auth:confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder={t('auth:passwordPlaceholder')}
            required
            disabled={isLoading}
            error={!!error}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('common:loading') : t('auth:signupButton')}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t('auth:hasAccount')} </span>
          <Link href="/login" className="text-primary hover:underline">
            {t('auth:login')}
          </Link>
        </div>
      </form>

      <OAuthButtons />
    </div>
  );
}
