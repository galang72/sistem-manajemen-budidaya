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
    const { name, size, capacity, type, status, notes } = body;

    const pond = await prisma.pond.update({
      where: { id: params.id },
      data: {
        name,
        size,
        capacity: capacity ? Number(capacity) : undefined,
        type,
        status,
        notes,
      },
    });

    return NextResponse.json(pond);
  } catch (error: any) {
    console.error('Error updating pond:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengubah kolam' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Cek apakah kolam sedang dipakai di siklus aktif
    const activeCycles = await prisma.cultivationCycle.count({
      where: { pondId: params.id, status: 'Aktif' },
    });

    if (activeCycles > 0) {
      return NextResponse.json(
        { error: 'Kolam tidak dapat dihapus karena masih digunakan dalam siklus budidaya aktif.' },
        { status: 400 }
      );
    }

    await prisma.pond.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Kolam berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting pond:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus kolam' }, { status: 500 });
  }
}
