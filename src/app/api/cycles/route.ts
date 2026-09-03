import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const pondId = searchParams.get('pondId');
    const search = searchParams.get('search');

    const where: any = { userId: user.id };
    if (status && status !== 'Semua') {
      where.status = status;
    }
    if (pondId && pondId !== 'Semua') {
      where.pondId = pondId;
    }
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { notes: { contains: search } },
        { pond: { name: { contains: search } } },
      ];
    }

    const cycles = await prisma.cultivationCycle.findMany({
      where,
      include: {
        pond: true,
        mortalities: true,
        harvests: true,
        feedRecords: true,
        transactions: true,
      },
      orderBy: { startDate: 'desc' },
    });

    // Kalkulasi metrik untuk tiap siklus
    const enrichedCycles = cycles.map((cycle) => {
      const totalDead = cycle.mortalities.reduce((sum, m) => sum + m.count, 0);
      const totalHarvested = cycle.harvests.reduce((sum, h) => sum + h.fishCount, 0);
      const totalHarvestWeightKg = cycle.harvests.reduce((sum, h) => sum + h.totalWeightKg, 0);
      const totalHarvestRevenue = cycle.harvests.reduce((sum, h) => sum + h.totalRevenue, 0);
      const totalFeedKg = cycle.feedRecords.reduce((sum, f) => sum + f.weightKg, 0);
      const totalFeedCost = cycle.feedRecords.reduce((sum, f) => sum + f.totalCost, 0);

      const totalTransactionsExpense = cycle.transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = Math.max(cycle.totalSeedCost + totalFeedCost, totalTransactionsExpense);
      const remainingFish = Math.max(0, cycle.initialFishCount - totalDead - totalHarvested);
      const mortalityRate = cycle.initialFishCount > 0 ? (totalDead / cycle.initialFishCount) * 100 : 0;
      const survivalRate = cycle.initialFishCount > 0 ? (totalHarvested / cycle.initialFishCount) * 100 : 0;
      const netProfit = totalHarvestRevenue - totalExpense;

      const fcr = totalHarvestWeightKg > 0 ? totalFeedKg / totalHarvestWeightKg : 0;
      const hppPerKg = totalHarvestWeightKg > 0 ? totalExpense / totalHarvestWeightKg : 0;
      const roi = totalExpense > 0 ? (netProfit / totalExpense) * 100 : 0;

      return {
        ...cycle,
        totalDead,
        totalHarvested,
        totalHarvestWeightKg,
        totalHarvestRevenue,
        totalFeedKg,
        totalFeedCost,
        totalExpense,
        remainingFish,
        mortalityRate,
        survivalRate,
        netProfit,
        fcr,
        hppPerKg,
        roi,
      };
    });

    return NextResponse.json(enrichedCycles);
  } catch (error: any) {
    console.error('Error listing cycles:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat siklus' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      code,
      pondId,
      startDate,
      harvestEstimateDate,
      initialFishCount,
      seedPricePerFish,
      totalSeedCost,
      seedSize,
      feedType,
      notes,
      status = 'Aktif',
    } = body;

    if (!code || !pondId || !startDate || !initialFishCount) {
      return NextResponse.json(
        { error: 'Kode siklus, kolam, tanggal mulai, dan jumlah bibit wajib diisi' },
        { status: 400 }
      );
    }

    const calculatedTotalSeedCost =
      totalSeedCost !== undefined && totalSeedCost !== null && Number(totalSeedCost) > 0
        ? Number(totalSeedCost)
        : Number(initialFishCount) * Number(seedPricePerFish || 0);

    // Buat siklus di database
    const newCycle = await prisma.cultivationCycle.create({
      data: {
        userId: user.id,
        pondId,
        code,
        startDate: new Date(startDate),
        harvestEstimateDate: harvestEstimateDate ? new Date(harvestEstimateDate) : null,
        initialFishCount: Number(initialFishCount),
        seedPricePerFish: Number(seedPricePerFish || 0),
        totalSeedCost: calculatedTotalSeedCost,
        seedSize: seedSize || '5-7 cm',
        feedType: feedType || 'Pelet Apung',
        status,
        notes,
      },
    });

    // Update status kolam menjadi 'Digunakan' jika siklus aktif
    if (status === 'Aktif') {
      await prisma.pond.update({
        where: { id: pondId },
        data: { status: 'Digunakan' },
      });
    }

    // Catat transaksi uang keluar otomatis untuk bibit jika ada nominal
    if (calculatedTotalSeedCost > 0) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          cycleId: newCycle.id,
          type: 'EXPENSE',
          category: 'Pembelian Bibit',
          source: 'Kas Usaha',
          amount: calculatedTotalSeedCost,
          date: new Date(startDate),
          notes: `Pembelian bibit siklus ${code} (${initialFishCount} ekor @ Rp ${seedPricePerFish || 0})`,
        },
      });
    }

    return NextResponse.json(newCycle, { status: 201 });
  } catch (error: any) {
    console.error('Error creating cycle:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat siklus' }, { status: 500 });
  }
}
