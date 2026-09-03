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
    const { date, feedType, weightKg, pricePerKg, notes } = body;

    const calculatedCost =
      weightKg !== undefined && pricePerKg !== undefined
        ? Number(weightKg) * Number(pricePerKg)
        : undefined;

    const feed = await prisma.feedRecord.update({
      where: { id: params.id },
      data: {
        date: date ? new Date(date) : undefined,
        feedType,
        weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
        pricePerKg: pricePerKg !== undefined ? Number(pricePerKg) : undefined,
        totalCost: calculatedCost,
        notes,
      },
    });

    return NextResponse.json(feed);
  } catch (error: any) {
    console.error('Error updating feed:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengubah catatan pakan' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.feedRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Catatan pakan berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting feed:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus catatan pakan' }, { status: 500 });
  }
}
