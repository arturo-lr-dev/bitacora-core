import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { defaultLocale, locales, type Locale } from './i18n/config';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Handle locale
  let locale: Locale = defaultLocale;
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else {
    const browserLocale = request.headers
      .get('accept-language')
      ?.split(',')[0]
      ?.split('-')[0];
    if (browserLocale && locales.includes(browserLocale as Locale)) {
      locale = browserLocale as Locale;
    }
  }

  response.headers.set('x-locale', locale);

  // Handle Supabase auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/signup');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/worker') ||
                           request.nextUrl.pathname.startsWith('/admin') ||
                           request.nextUrl.pathname.startsWith('/client') ||
                           request.nextUrl.pathname.startsWith('/dashboard');

  // Redirect authenticated users from auth pages to their dashboard
  if (session && isAuthPage) {
    // Get user role from Prisma to redirect to correct dashboard
    const { getUserWithRole } = await import('@/lib/user/getOrCreateUser');
    const user = await getUserWithRole(session.user.id);

    if (user) {
      const dashboardPath = user.role === 'ADMIN' ? '/admin' :
                            user.role === 'CLIENT' ? '/client' : '/worker';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  // Redirect unauthenticated users from protected routes to login
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
