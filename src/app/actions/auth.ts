'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, signupSchema } from '@/lib/validations/auth.schema';
import type { ActionResponse } from '@/lib/utils/actionResponse';

export async function login(formData: FormData): Promise<ActionResponse<{ redirectTo: string }>> {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'auth:errors.invalidData' };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword(result.data);

  if (error || !authData.user) {
    return { success: false, error: 'auth:errors.invalidCredentials' };
  }

  // Sincronizar con Prisma y obtener el rol del usuario
  const { getOrCreateUser } = await import('@/lib/user/getOrCreateUser');
  const user = await getOrCreateUser(authData.user.id, authData.user.email!);

  // Redirigir según el rol
  const dashboardPath = user.role === 'ADMIN' ? '/admin' :
                        user.role === 'CLIENT' ? '/client' : '/worker';

  revalidatePath('/', 'layout');
  return { success: true, data: { redirectTo: dashboardPath } };
}

export async function signup(formData: FormData): Promise<ActionResponse<{ redirectTo: string }>> {
  const result = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'auth:errors.invalidData' };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (error || !authData.user) {
    return { success: false, error: error?.message ?? 'auth:errors.genericError' };
  }

  // Crear usuario en Prisma como WORKER por defecto
  const { getOrCreateUser } = await import('@/lib/user/getOrCreateUser');
  await getOrCreateUser(authData.user.id, authData.user.email!);

  revalidatePath('/', 'layout');
  return { success: true, data: { redirectTo: '/worker' } };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function signInWithGoogle(): Promise<ActionResponse<{ url: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: 'auth:errors.oauthError' };
  }

  return { success: true, data: { url: data.url } };
}

export async function signInWithApple(): Promise<ActionResponse<{ url: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: 'auth:errors.oauthError' };
  }

  return { success: true, data: { url: data.url } };
}
