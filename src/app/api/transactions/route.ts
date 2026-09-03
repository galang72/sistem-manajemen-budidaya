import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // "INCOME" | "EXPENSE"
    const category = searchParams.get('category');
    const cycleId = searchParams.get('cycleId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { userId: user.id };

    if (type && type !== 'Semua') where.type = type;
    if (category && category !== 'Semua') where.category = category;
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
      include: {
        cycle: {
          select: { id: true, code: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Hitung ringkasan
    let totalIncome = 0;
    let totalExpense = 0;

    // Untuk akumulasi summary yang akurat, kita juga hitung total keseluruhan user
    const allUserTx = await prisma.transaction.findMany({
      where: { userId: user.id },
      select: { type: true, amount: true },
    });

    allUserTx.forEach((tx) => {
      if (tx.type === 'INCOME') totalIncome += tx.amount;
      if (tx.type === 'EXPENSE') totalExpense += tx.amount;
    });

    const cashBalance = totalIncome - totalExpense;

    return NextResponse.json({
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        cashBalance,
      },
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat transaksi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, category, source, amount, date, cycleId, notes } = body;

    if (!type || !category || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'Tipe transaksi, kategori, dan nominal wajib diisi dengan benar' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type, // "INCOME" | "EXPENSE"
        category,
        source: source || (type === 'INCOME' ? 'Pemasukan Tunai' : 'Kas Usaha'),
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        cycleId: cycleId && cycleId !== 'Semua' && cycleId !== '' ? cycleId : null,
        notes,
      },
      include: {
        cycle: {
          select: { id: true, code: true },
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: error.message || 'Gagal menyimpan transaksi' }, { status: 500 });
  }
}
