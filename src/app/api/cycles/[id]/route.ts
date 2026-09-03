import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cycle = await prisma.cultivationCycle.findUnique({
      where: { id: params.id },
      include: {
        pond: true,
        mortalities: {
          orderBy: { date: 'desc' },
        },
        harvests: {
          orderBy: { date: 'desc' },
        },
        feedRecords: {
          orderBy: { date: 'desc' },
        },
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Siklus tidak ditemukan' }, { status: 404 });
    }

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

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error('Error getting cycle details:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat detail siklus' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      code,
      pondId,
      startDate,
      harvestEstimateDate,
      endDate,
      initialFishCount,
      seedPricePerFish,
      totalSeedCost,
      seedSize,
      feedType,
      status,
      notes,
    } = body;

    const existingCycle = await prisma.cultivationCycle.findUnique({
      where: { id: params.id },
    });

    if (!existingCycle) {
      return NextResponse.json({ error: 'Siklus tidak ditemukan' }, { status: 404 });
    }

    const updatedCycle = await prisma.cultivationCycle.update({
      where: { id: params.id },
      data: {
        code: code ?? existingCycle.code,
        pondId: pondId ?? existingCycle.pondId,
        startDate: startDate ? new Date(startDate) : existingCycle.startDate,
        harvestEstimateDate: harvestEstimateDate ? new Date(harvestEstimateDate) : existingCycle.harvestEstimateDate,
        endDate: endDate ? new Date(endDate) : existingCycle.endDate,
        initialFishCount: initialFishCount ? Number(initialFishCount) : existingCycle.initialFishCount,
        seedPricePerFish: seedPricePerFish !== undefined ? Number(seedPricePerFish) : existingCycle.seedPricePerFish,
        totalSeedCost: totalSeedCost !== undefined ? Number(totalSeedCost) : existingCycle.totalSeedCost,
        seedSize: seedSize ?? existingCycle.seedSize,
        feedType: feedType ?? existingCycle.feedType,
        status: status ?? existingCycle.status,
        notes: notes ?? existingCycle.notes,
      },
    });

    // Jika siklus diselesaikan atau dibatalkan, cek apakah kolam masih memiliki siklus aktif lain
    if (status && status !== 'Aktif') {
      const otherActiveCycles = await prisma.cultivationCycle.count({
        where: {
          pondId: updatedCycle.pondId,
          status: 'Aktif',
          id: { not: params.id },
        },
      });
      if (otherActiveCycles === 0) {
        await prisma.pond.update({
          where: { id: updatedCycle.pondId },
          data: { status: 'Kosong' },
        });
      }
    } else if (status === 'Aktif') {
      await prisma.pond.update({
        where: { id: updatedCycle.pondId },
        data: { status: 'Digunakan' },
      });
    }

    return NextResponse.json(updatedCycle);
  } catch (error: any) {
    console.error('Error updating cycle:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengubah siklus' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cycle = await prisma.cultivationCycle.findUnique({
      where: { id: params.id },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Siklus tidak ditemukan' }, { status: 404 });
    }

    await prisma.cultivationCycle.delete({
      where: { id: params.id },
    });

    // Cek apakah ada siklus aktif lain di kolam tersebut
    const otherActive = await prisma.cultivationCycle.count({
      where: { pondId: cycle.pondId, status: 'Aktif' },
    });
    if (otherActive === 0) {
      await prisma.pond.update({
        where: { id: cycle.pondId },
        data: { status: 'Kosong' },
      });
    }

    return NextResponse.json({ success: true, message: 'Siklus berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting cycle:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus siklus' }, { status: 500 });
  }
}
