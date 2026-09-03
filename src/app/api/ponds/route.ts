import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ponds = await prisma.pond.findMany({
      where: { userId: user.id },
      include: {
        cycles: {
          where: { status: 'Aktif' },
          select: { id: true, code: true, initialFishCount: true, startDate: true, status: true },
        },
        _count: {
          select: { cycles: true, mortalities: true, harvests: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(ponds);
  } catch (error: any) {
    console.error('Error fetching ponds:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat kolam' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, size, capacity, type, status = 'Kosong', notes } = body;

    if (!name || !capacity || !type) {
      return NextResponse.json({ error: 'Nama, kapasitas, dan jenis kolam wajib diisi' }, { status: 400 });
    }

    const pond = await prisma.pond.create({
      data: {
        userId: user.id,
        name,
        size: size || '-',
        capacity: Number(capacity),
        type,
        status,
        notes,
      },
    });

    return NextResponse.json(pond, { status: 201 });
  } catch (error: any) {
    console.error('Error creating pond:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat kolam' }, { status: 500 });
  }
}
