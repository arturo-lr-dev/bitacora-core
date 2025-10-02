import { prisma } from '@/lib/prisma/client';
import { User, AuthProvider } from '@prisma/client';

export async function getOrCreateUser(
  supabaseUserId: string,
  email: string,
  provider: AuthProvider = 'EMAIL'
): Promise<User> {
  // Intentar obtener el usuario existente
  let user = await prisma.user.findUnique({
    where: { id: supabaseUserId },
  });

  // Si no existe, crearlo como WORKER por defecto
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        role: 'WORKER', // Rol por defecto
        status: 'ACTIVE',
        authProvider: provider,
      },
    });
  }

  return user;
}

export async function getUserWithRole(supabaseUserId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id: supabaseUserId },
  });
}
