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
    const { date, count, cause, notes } = body;

    const mortality = await prisma.fishMortality.update({
      where: { id: params.id },
      data: {
        date: date ? new Date(date) : undefined,
        count: count ? Number(count) : undefined,
        cause,
        notes,
      },
    });

    return NextResponse.json(mortality);
  } catch (error: any) {
    console.error('Error updating mortality:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengubah catatan kematian' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.fishMortality.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Catatan kematian berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting mortality:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus catatan kematian' }, { status: 500 });
  }
}
