import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if the phone model exists and is deleted
    const phoneModel = await prisma.phoneModel.findUnique({
      where: { id, status: 'deleted' },
    });

    if (!phoneModel) {
      return NextResponse.json(
        { error: 'Modelo no encontrado o ya está activo' },
        { status: 404 }
      );
    }

    // Restore the phone model by setting status to 'active'
    await prisma.phoneModel.update({
      where: { id },
      data: { status: 'active' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error restoring phone model:', error);
    return NextResponse.json(
      { error: 'Error al restaurar el modelo' },
      { status: 500 }
    );
  }
}
