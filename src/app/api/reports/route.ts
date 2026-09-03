import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'keuangan'; // 'keuangan', 'budidaya', 'panen'
    const cycleId = searchParams.get('cycleId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (type === 'keuangan') {
      const where: any = { userId: user.id };
      if (cycleId && cycleId !== 'Semua') where.cycleId = cycleId;
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.date.lte = end;
        }
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: { cycle: { select: { code: true } } },
        orderBy: { date: 'desc' },
      });

      let totalIncome = 0;
      let totalExpense = 0;
      transactions.forEach((tx) => {
        if (tx.type === 'INCOME') totalIncome += tx.amount;
        else totalExpense += tx.amount;
      });

      const cashBalance = totalIncome - totalExpense;

      return NextResponse.json({
        type: 'keuangan',
        summary: {
          totalIncome,
          totalExpense,
          cashBalance,
          netProfitOrLoss: cashBalance,
          count: transactions.length,
        },
        data: transactions,
      });
    } else if (type === 'budidaya') {
      const where: any = { userId: user.id };
      if (cycleId && cycleId !== 'Semua') where.id = cycleId;

      const cycles = await prisma.cultivationCycle.findMany({
        where,
        include: {
          pond: true,
          mortalities: true,
          harvests: true,
          feedRecords: true,
        },
        orderBy: { startDate: 'desc' },
      });

      let totalInitialFish = 0;
      let totalDeadFish = 0;
      let totalHarvestedFish = 0;

      const cycleRows = cycles.map((c) => {
        const dead = c.mortalities.reduce((s, m) => s + m.count, 0);
        const harvested = c.harvests.reduce((s, h) => s + h.fishCount, 0);
        const remaining = Math.max(0, c.initialFishCount - dead - harvested);
        const mortalityRate = c.initialFishCount > 0 ? (dead / c.initialFishCount) * 100 : 0;
        const survivalRate = c.initialFishCount > 0 ? (harvested / c.initialFishCount) * 100 : 0;

        totalInitialFish += c.initialFishCount;
        totalDeadFish += dead;
        totalHarvestedFish += harvested;

        return {
          id: c.id,
          code: c.code,
          pondName: c.pond.name,
          startDate: c.startDate,
          status: c.status,
          initialFishCount: c.initialFishCount,
          deadCount: dead,
          mortalityRate,
          harvestedCount: harvested,
          survivalRate,
          remainingFish: remaining,
        };
      });

      const totalRemainingFish = Math.max(0, totalInitialFish - totalDeadFish - totalHarvestedFish);
      const overallMortalityRate = totalInitialFish > 0 ? (totalDeadFish / totalInitialFish) * 100 : 0;
      const overallSurvivalRate = totalInitialFish > 0 ? (totalHarvestedFish / totalInitialFish) * 100 : 0;

      return NextResponse.json({
        type: 'budidaya',
        summary: {
          totalInitialFish,
          totalDeadFish,
          totalHarvestedFish,
          totalRemainingFish,
          overallMortalityRate,
          overallSurvivalRate,
        },
        data: cycleRows,
      });
    } else if (type === 'panen') {
      const where: any = { cycle: { userId: user.id } };
      if (cycleId && cycleId !== 'Semua') where.cycleId = cycleId;
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.date.lte = end;
        }
      }

      const harvests = await prisma.harvest.findMany({
        where,
        include: {
          cycle: { select: { code: true } },
          pond: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      });

      let totalWeightKg = 0;
      let totalFishCount = 0;
      let totalRevenue = 0;

      harvests.forEach((h) => {
        totalWeightKg += h.totalWeightKg;
        totalFishCount += h.fishCount;
        totalRevenue += h.totalRevenue;
      });

      const avgPricePerKg = totalWeightKg > 0 ? totalRevenue / totalWeightKg : 0;
      const avgFishWeightGram = totalFishCount > 0 ? (totalWeightKg * 1000) / totalFishCount : 0;

      return NextResponse.json({
        type: 'panen',
        summary: {
          totalWeightKg,
          totalFishCount,
          totalRevenue,
          avgPricePerKg,
          avgFishWeightGram,
          count: harvests.length,
        },
        data: harvests,
      });
    }

    return NextResponse.json({ error: 'Tipe laporan tidak valid' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat laporan' }, { status: 500 });
  }
}
