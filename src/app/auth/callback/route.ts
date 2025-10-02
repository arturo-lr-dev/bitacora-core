import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/user/getOrCreateUser';
import { AuthProvider } from '@prisma/client';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      // Detectar el provider desde los metadatos de Supabase
      const provider = data.user.app_metadata.provider;
      let authProvider: AuthProvider = 'EMAIL';

      if (provider === 'google') authProvider = 'GOOGLE';
      else if (provider === 'apple') authProvider = 'APPLE';

      // Sincronizar con Prisma
      const user = await getOrCreateUser(data.user.id, data.user.email!, authProvider);

      // Redirigir según el rol
      const dashboardPath = user.role === 'ADMIN' ? '/admin' :
                            user.role === 'CLIENT' ? '/client' : '/worker';

      return NextResponse.redirect(`${origin}${dashboardPath}`);
    }
  }

  // Redirect to login if something fails
  return NextResponse.redirect(`${origin}/login`);
}
