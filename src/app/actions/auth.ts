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
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return { success: false, error: 'auth:errors.invalidCredentials' };
  }

  revalidatePath('/', 'layout');
  return { success: true, data: { redirectTo: '/dashboard' } };
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
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true, data: { redirectTo: '/dashboard' } };
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
