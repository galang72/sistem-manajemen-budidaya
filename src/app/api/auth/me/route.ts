import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, farmName } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name ?? user.name,
        farmName: farmName ?? user.farmName,
      },
      select: { id: true, email: true, name: true, farmName: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengubah profil' }, { status: 500 });
  }
}
