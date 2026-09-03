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
    const { date, fishCount, totalWeightKg, pricePerKg, buyerName, notes } = body;

    const calculatedRevenue =
      totalWeightKg !== undefined && pricePerKg !== undefined
        ? Number(totalWeightKg) * Number(pricePerKg)
        : undefined;

    const harvest = await prisma.harvest.update({
      where: { id: params.id },
      data: {
        date: date ? new Date(date) : undefined,
        fishCount: fishCount !== undefined ? Number(fishCount) : undefined,
        totalWeightKg: totalWeightKg !== undefined ? Number(totalWeightKg) : undefined,
        pricePerKg: pricePerKg !== undefined ? Number(pricePerKg) : undefined,
        totalRevenue: calculatedRevenue,
        buyerName,
        notes,
      },
    });

    return NextResponse.json(harvest);
  } catch (error: any) {
    console.error('Error updating harvest:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengubah panen' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.harvest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Catatan panen berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting harvest:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus panen' }, { status: 500 });
  }
}
