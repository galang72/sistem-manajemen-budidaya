import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cycles = await prisma.cultivationCycle.findMany({
      where: { userId: user.id },
      include: {
        pond: true,
        mortalities: true,
        harvests: true,
        feedRecords: true,
        transactions: true,
      },
      orderBy: { startDate: 'desc' },
    });

    const cycleAnalytics = cycles.map((cycle) => {
      const initialCount = cycle.initialFishCount;
      const deadCount = cycle.mortalities.reduce((sum, m) => sum + m.count, 0);
      const harvestCount = cycle.harvests.reduce((sum, h) => sum + h.fishCount, 0);
      const totalHarvestKg = cycle.harvests.reduce((sum, h) => sum + h.totalWeightKg, 0);
      const totalRevenue = cycle.harvests.reduce((sum, h) => sum + h.totalRevenue, 0);
      const totalFeedKg = cycle.feedRecords.reduce((sum, f) => sum + f.weightKg, 0);
      const totalFeedCost = cycle.feedRecords.reduce((sum, f) => sum + f.totalCost, 0);

      // Biaya siklus: kombinasi bibit + pakan + transaksi pengeluaran
      const otherExpenses = cycle.transactions
        .filter((t) => t.type === 'EXPENSE' && t.category !== 'Pembelian Bibit' && t.category !== 'Pakan')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalProductionCost = cycle.totalSeedCost + totalFeedCost + otherExpenses;
      const netProfit = totalRevenue - totalProductionCost;

      // Rumus standar akuakultur
      const survivalRate = initialCount > 0 ? (harvestCount / initialCount) * 100 : 0;
      const mortalityRate = initialCount > 0 ? (deadCount / initialCount) * 100 : 0;
      const fcr = totalHarvestKg > 0 ? totalFeedKg / totalHarvestKg : 0;
      const hppPerKg = totalHarvestKg > 0 ? totalProductionCost / totalHarvestKg : 0;
      const roi = totalProductionCost > 0 ? (netProfit / totalProductionCost) * 100 : 0;

      // Status evaluasi FCR
      let fcrStatus = 'Belum Panen';
      if (totalHarvestKg > 0) {
        if (fcr <= 1.05) fcrStatus = 'Sangat Efisien';
        else if (fcr <= 1.25) fcrStatus = 'Standar Bagus';
        else fcrStatus = 'Boros Pakan';
      }

      return {
        id: cycle.id,
        code: cycle.code,
        pondName: cycle.pond.name,
        status: cycle.status,
        startDate: cycle.startDate,
        initialCount,
        deadCount,
        harvestCount,
        totalHarvestKg,
        totalFeedKg,
        totalFeedCost,
        totalProductionCost,
        totalRevenue,
        netProfit,
        survivalRate,
        mortalityRate,
        fcr,
        fcrStatus,
        hppPerKg,
        roi,
      };
    });

    // Farm Average
    const completedCycles = cycleAnalytics.filter((c) => c.status === 'Selesai');
    const avgFcr =
      completedCycles.length > 0
        ? completedCycles.reduce((s, c) => s + c.fcr, 0) / completedCycles.length
        : 0;
    const avgSR =
      completedCycles.length > 0
        ? completedCycles.reduce((s, c) => s + c.survivalRate, 0) / completedCycles.length
        : 0;
    const avgHpp =
      completedCycles.length > 0
        ? completedCycles.reduce((s, c) => s + c.hppPerKg, 0) / completedCycles.length
        : 0;
    const avgRoi =
      completedCycles.length > 0
        ? completedCycles.reduce((s, c) => s + c.roi, 0) / completedCycles.length
        : 0;

    return NextResponse.json({
      cycleAnalytics,
      farmSummary: {
        avgFcr,
        avgSR,
        avgHpp,
        avgRoi,
        totalCyclesAnalyzed: cycles.length,
        completedCyclesAnalyzed: completedCycles.length,
      },
    });
  } catch (error: any) {
    console.error('Error calculating analytics:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat analisis' }, { status: 500 });
  }
}
