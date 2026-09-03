import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('filter') || 'Bulan'; // 'Hari', 'Minggu', 'Bulan', 'Tahun', 'Semua'
    const cycleId = searchParams.get('cycleId');

    const now = new Date();
    let startDate: Date | null = null;

    if (filterType === 'Hari') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (filterType === 'Minggu') {
      const day = now.getDay() || 7;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1, 0, 0, 0);
    } else if (filterType === 'Bulan') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else if (filterType === 'Tahun') {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    }

    const txWhere: any = { userId: user.id };
    if (cycleId && cycleId !== 'Semua') {
      txWhere.cycleId = cycleId;
    }
    if (startDate) {
      txWhere.date = { gte: startDate };
    }

    const transactions = await prisma.transaction.findMany({
      where: txWhere,
      orderBy: { date: 'asc' },
    });

    // Kategorisasi Pendapatan dan Biaya
    const incomeCategories: { [cat: string]: number } = {};
    const expenseCategories: { [cat: string]: number } = {};
    let totalRevenue = 0;
    let totalCost = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        totalRevenue += tx.amount;
        incomeCategories[tx.category] = (incomeCategories[tx.category] || 0) + tx.amount;
      } else {
        totalCost += tx.amount;
        expenseCategories[tx.category] = (expenseCategories[tx.category] || 0) + tx.amount;
      }
    });

    const netAmount = totalRevenue - totalCost;
    const isProfit = netAmount >= 0;
    const profit = isProfit ? netAmount : 0;
    const loss = !isProfit ? Math.abs(netAmount) : 0;
    const profitMargin = totalRevenue > 0 ? (netAmount / totalRevenue) * 100 : 0;

    // Ambil data panen terkait untuk metrik per kg
    const harvestWhere: any = { cycle: { userId: user.id } };
    if (cycleId && cycleId !== 'Semua') harvestWhere.cycleId = cycleId;
    if (startDate) harvestWhere.date = { gte: startDate };

    const harvests = await prisma.harvest.findMany({
      where: harvestWhere,
    });

    const totalHarvestKg = harvests.reduce((sum, h) => sum + h.totalWeightKg, 0);

    const costPerKg = totalHarvestKg > 0 ? totalCost / totalHarvestKg : 0;
    const revenuePerKg = totalHarvestKg > 0 ? totalRevenue / totalHarvestKg : 0;
    const profitPerKg = totalHarvestKg > 0 ? netAmount / totalHarvestKg : 0;

    return NextResponse.json({
      totalRevenue,
      totalCost,
      netAmount,
      isProfit,
      profit,
      loss,
      profitMargin,
      totalHarvestKg,
      costPerKg,
      revenuePerKg,
      profitPerKg,
      incomeCategories: Object.entries(incomeCategories).map(([name, value]) => ({ name, value })),
      expenseCategories: Object.entries(expenseCategories).map(([name, value]) => ({ name, value })),
    });
  } catch (error: any) {
    console.error('Error fetching profit loss:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat laba rugi' }, { status: 500 });
  }
}
