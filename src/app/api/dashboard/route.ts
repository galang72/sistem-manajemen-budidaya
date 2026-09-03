import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 401 });
    }

    // 1. Ambil seluruh transaksi
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: 'asc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') totalIncome += tx.amount;
      if (tx.type === 'EXPENSE') totalExpense += tx.amount;
    });

    const cashBalance = totalIncome - totalExpense;
    const totalProfit = cashBalance > 0 ? cashBalance : 0;
    const totalLoss = cashBalance < 0 ? Math.abs(cashBalance) : 0;

    // 2. Siklus budidaya
    const cycles = await prisma.cultivationCycle.findMany({
      where: { userId: user.id },
      include: {
        pond: true,
        mortalities: true,
        harvests: true,
        feedRecords: true,
      },
      orderBy: { startDate: 'desc' },
    });

    const activeCycles = cycles.filter((c) => c.status === 'Aktif');
    const completedCycles = cycles.filter((c) => c.status === 'Selesai');

    // Total ikan
    let totalCultivatedFish = 0;
    let totalDeadFish = 0;
    let totalHarvestedFish = 0;

    cycles.forEach((c) => {
      totalCultivatedFish += c.initialFishCount;
      c.mortalities.forEach((m) => {
        totalDeadFish += m.count;
      });
      c.harvests.forEach((h) => {
        totalHarvestedFish += h.fishCount;
      });
    });

    // 3. Data Grafik Bulanan (Pemasukan, Pengeluaran, Laba/Rugi)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyMap: { [key: string]: { month: string; income: number; expense: number; profit: number } } = {};

    // Inisialisasi 6 bulan terakhir
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyMap[key] = { month: label, income: 0, expense: 0, profit: 0 };
    }

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        if (tx.type === 'INCOME') monthlyMap[key].income += tx.amount;
        if (tx.type === 'EXPENSE') monthlyMap[key].expense += tx.amount;
      }
    });

    const monthlyFinancials = Object.values(monthlyMap).map((m) => ({
      ...m,
      profit: m.income - m.expense,
    }));

    // 4. Grafik tren kematian ikan
    const allMortalities = await prisma.fishMortality.findMany({
      where: { cycle: { userId: user.id } },
      include: { cycle: true },
      orderBy: { date: 'asc' },
    });

    const mortalityTrendMap: { [key: string]: { date: string; count: number; cause: string } } = {};
    allMortalities.forEach((m) => {
      const d = new Date(m.date);
      const dateKey = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      if (!mortalityTrendMap[dateKey]) {
        mortalityTrendMap[dateKey] = { date: dateKey, count: 0, cause: m.cause };
      }
      mortalityTrendMap[dateKey].count += m.count;
    });
    const mortalityTrend = Object.values(mortalityTrendMap);

    // 5. Grafik hasil panen per siklus
    const harvestByCycle = cycles
      .filter((c) => c.harvests.length > 0)
      .map((c) => {
        const totalKg = c.harvests.reduce((sum, h) => sum + h.totalWeightKg, 0);
        const totalRev = c.harvests.reduce((sum, h) => sum + h.totalRevenue, 0);
        return {
          code: c.code,
          weightKg: totalKg,
          revenue: totalRev,
          initialFish: c.initialFishCount,
        };
      });

    // 6. Aktivitas Terbaru (Gabungan Transaksi, Kematian, Panen, Pakan)
    const recentActivities: any[] = [];

    transactions.slice(-5).reverse().forEach((tx) => {
      recentActivities.push({
        id: `tx-${tx.id}`,
        type: tx.type === 'INCOME' ? 'income' : 'expense',
        title: tx.category,
        description: `${tx.source || 'Kas'} - ${tx.notes || ''}`,
        amount: tx.amount,
        date: tx.date,
      });
    });

    allMortalities.slice(-4).reverse().forEach((m) => {
      recentActivities.push({
        id: `mort-${m.id}`,
        type: 'mortality',
        title: `Kematian ${m.count} ekor`,
        description: `Sebab: ${m.cause} (${m.cycle.code})`,
        amount: null,
        date: m.date,
      });
    });

    const allHarvests = await prisma.harvest.findMany({
      where: { cycle: { userId: user.id } },
      include: { cycle: true },
      orderBy: { date: 'desc' },
      take: 4,
    });

    allHarvests.forEach((h) => {
      recentActivities.push({
        id: `harv-${h.id}`,
        type: 'harvest',
        title: `Panen ${h.totalWeightKg} kg (${h.fishCount} ekor)`,
        description: `Pembeli: ${h.buyerName} - Siklus ${h.cycle.code}`,
        amount: h.totalRevenue,
        date: h.date,
      });
    });

    // Urutkan recentActivities berdasarkan tanggal terbaru
    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 7. Smart Alerts
    const alerts: any[] = [];

    // Cek mortalitas tinggi (> 5% pada siklus aktif)
    activeCycles.forEach((cycle) => {
      const dead = cycle.mortalities.reduce((sum, m) => sum + m.count, 0);
      const mortalityRate = (dead / cycle.initialFishCount) * 100;
      if (mortalityRate >= 5) {
        alerts.push({
          id: `alert-mort-${cycle.id}`,
          type: 'danger',
          title: `Tingkat Kematian Tinggi: Siklus ${cycle.code}`,
          message: `Mortalitas mencapai ${mortalityRate.toFixed(1)}% (${dead} dari ${cycle.initialFishCount} ekor). Periksa kualitas air dan pemberian pakan.`,
          linkHref: `/siklus/${cycle.id}`,
          linkText: 'Buka Detail Siklus',
        });
      }
    });

    // Cek siklus mendekati panen (estimasi panen <= 7 hari lagi)
    activeCycles.forEach((cycle) => {
      if (cycle.harvestEstimateDate) {
        const estDate = new Date(cycle.harvestEstimateDate);
        const diffDays = Math.ceil((estDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 14) {
          alerts.push({
            id: `alert-harv-${cycle.id}`,
            type: 'warning',
            title: `Mendekati Estimasi Panen: Siklus ${cycle.code}`,
            message: `Estimasi panen dalam ${diffDays} hari (${estDate.toLocaleDateString('id-ID')}). Siapkan sortir dan kontak pembeli/pengepul.`,
            linkHref: `/panen?cycleId=${cycle.id}`,
            linkText: 'Catat Panen Sekarang',
          });
        }
      }
    });

    // Cek keuangan bulan berjalan: Pengeluaran > Pemasukan
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthData = monthlyMap[currentMonthKey];
    if (currentMonthData && currentMonthData.expense > currentMonthData.income && currentMonthData.expense > 1000000) {
      alerts.push({
        id: 'alert-cashflow',
        type: 'info',
        title: 'Arus Kas Bulan Berjalan',
        message: `Pengeluaran bulan ini melebihi pemasukan (Biaya pakan/bibit berjalan). Saldo akan berbalik positif setelah panen raya.`,
        linkHref: '/keuangan',
        linkText: 'Lihat Kas Usaha',
      });
    }

    return NextResponse.json({
      stats: {
        totalIncome,
        totalExpense,
        totalProfit,
        totalLoss,
        cashBalance,
        totalCultivatedFish,
        totalDeadFish,
        totalHarvestedFish,
        activeCyclesCount: activeCycles.length,
        completedCyclesCount: completedCycles.length,
      },
      monthlyFinancials,
      mortalityTrend,
      harvestByCycle,
      recentActivities: recentActivities.slice(0, 8),
      alerts,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat dashboard' }, { status: 500 });
  }
}
