import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycleId');

    const where: any = {
      cycle: { userId: user.id },
    };

    if (cycleId && cycleId !== 'Semua') where.cycleId = cycleId;

    const feeds = await prisma.feedRecord.findMany({
      where,
      include: {
        cycle: {
          select: { id: true, code: true, status: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(feeds);
  } catch (error: any) {
    console.error('Error fetching feed records:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat catatan pakan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      cycleId,
      date,
      feedType,
      weightKg,
      pricePerKg,
      notes,
      autoCreateTransaction = true,
    } = body;

    if (!cycleId || !feedType || !weightKg || !pricePerKg) {
      return NextResponse.json(
        { error: 'Siklus, jenis pakan, jumlah kg, dan harga/kg wajib diisi' },
        { status: 400 }
      );
    }

    const calculatedCost = Number(weightKg) * Number(pricePerKg);

    const feed = await prisma.feedRecord.create({
      data: {
        cycleId,
        date: date ? new Date(date) : new Date(),
        feedType,
        weightKg: Number(weightKg),
        pricePerKg: Number(pricePerKg),
        totalCost: calculatedCost,
        notes,
      },
    });

    // Otomatis buat pengeluaran di kas jika diinginkan
    if (autoCreateTransaction && calculatedCost > 0) {
      const cycle = await prisma.cultivationCycle.findUnique({ where: { id: cycleId } });
      await prisma.transaction.create({
        data: {
          userId: user.id,
          cycleId,
          type: 'EXPENSE',
          category: 'Pakan',
          source: 'Kas Usaha',
          amount: calculatedCost,
          date: date ? new Date(date) : new Date(),
          notes: `Pakan ${feedType} (${weightKg} kg @ Rp ${Number(pricePerKg).toLocaleString('id-ID')}) - Siklus ${cycle?.code || ''}`,
        },
      });
    }

    return NextResponse.json(feed, { status: 201 });
  } catch (error: any) {
    console.error('Error creating feed record:', error);
    return NextResponse.json({ error: error.message || 'Gagal menyimpan catatan pakan' }, { status: 500 });
  }
}
