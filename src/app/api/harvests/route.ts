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

    const harvests = await prisma.harvest.findMany({
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

    return NextResponse.json(harvests);
  } catch (error: any) {
    console.error('Error fetching harvests:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat catatan panen' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      cycleId,
      pondId,
      date,
      fishCount,
      totalWeightKg,
      pricePerKg,
      buyerName,
      notes,
      autoCreateTransaction = true,
    } = body;

    if (!cycleId || !fishCount || !totalWeightKg || !pricePerKg) {
      return NextResponse.json(
        { error: 'Siklus, jumlah ekor, berat total, dan harga jual per kg wajib diisi' },
        { status: 400 }
      );
    }

    const calculatedRevenue = Number(totalWeightKg) * Number(pricePerKg);

    let targetPondId = pondId;
    let cycleCode = '';
    const cycle = await prisma.cultivationCycle.findUnique({
      where: { id: cycleId },
    });
    if (cycle) {
      if (!targetPondId) targetPondId = cycle.pondId;
      cycleCode = cycle.code;
    }

    const harvest = await prisma.harvest.create({
      data: {
        cycleId,
        pondId: targetPondId,
        date: date ? new Date(date) : new Date(),
        fishCount: Number(fishCount),
        totalWeightKg: Number(totalWeightKg),
        pricePerKg: Number(pricePerKg),
        totalRevenue: calculatedRevenue,
        buyerName: buyerName || 'Umum',
        notes,
      },
    });

    // Otomatis buat transaksi pemasukan keuangan
    if (autoCreateTransaction && calculatedRevenue > 0) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          cycleId,
          type: 'INCOME',
          category: 'Pendapatan Panen',
          source: buyerName ? `Pembeli: ${buyerName}` : 'Pengepul',
          amount: calculatedRevenue,
          date: date ? new Date(date) : new Date(),
          notes: `Hasil panen siklus ${cycleCode} (${totalWeightKg} kg @ Rp ${Number(pricePerKg).toLocaleString('id-ID')})`,
        },
      });
    }

    return NextResponse.json(harvest, { status: 201 });
  } catch (error: any) {
    console.error('Error creating harvest:', error);
    return NextResponse.json({ error: error.message || 'Gagal mencatat panen' }, { status: 500 });
  }
}
