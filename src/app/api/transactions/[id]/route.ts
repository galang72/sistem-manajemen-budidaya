import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, category, source, amount, date, cycleId, notes } = body;

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        type,
        category,
        source,
        amount: amount !== undefined ? Number(amount) : undefined,
        date: date ? new Date(date) : undefined,
        cycleId: cycleId === 'Semua' || cycleId === '' ? null : cycleId,
        notes,
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengubah transaksi' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.transaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus transaksi' }, { status: 500 });
  }
}
