import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycleId');
    const pondId = searchParams.get('pondId');

    const where: any = {
      cycle: { userId: user.id },
    };

    if (cycleId && cycleId !== 'Semua') where.cycleId = cycleId;
    if (pondId && pondId !== 'Semua') where.pondId = pondId;

    const mortalities = await prisma.fishMortality.findMany({
      where,
      include: {
        cycle: {
          select: { id: true, code: true, initialFishCount: true, status: true },
        },
        pond: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(mortalities);
  } catch (error: any) {
    console.error('Error fetching mortalities:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat catatan kematian' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { cycleId, pondId, date, count, cause, notes } = body;

    if (!cycleId || !count || Number(count) <= 0) {
      return NextResponse.json({ error: 'Siklus dan jumlah ikan mati wajib diisi dengan benar' }, { status: 400 });
    }

    // Jika pondId tidak disediakan, cari dari siklus
    let targetPondId = pondId;
    if (!targetPondId) {
      const cycle = await prisma.cultivationCycle.findUnique({
        where: { id: cycleId },
      });
      if (!cycle) return NextResponse.json({ error: 'Siklus tidak ditemukan' }, { status: 404 });
      targetPondId = cycle.pondId;
    }

    const mortality = await prisma.fishMortality.create({
      data: {
        cycleId,
        pondId: targetPondId,
        date: date ? new Date(date) : new Date(),
        count: Number(count),
        cause: cause || 'Kualitas Air',
        notes,
      },
      include: {
        cycle: true,
        pond: true,
      },
    });

    return NextResponse.json(mortality, { status: 201 });
  } catch (error: any) {
    console.error('Error creating mortality record:', error);
    return NextResponse.json({ error: error.message || 'Gagal menyimpan catatan kematian' }, { status: 500 });
  }
}
