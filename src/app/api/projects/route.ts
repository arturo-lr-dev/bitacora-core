import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getUserWithRole } from '@/lib/user/getOrCreateUser';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await getUserWithRole(session.user.id);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
