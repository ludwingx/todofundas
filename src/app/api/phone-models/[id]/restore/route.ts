import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    console.log('Attempting to restore phone model:', id);

    // Check if the phone model exists
    const phoneModel = await prisma.phoneModel.findUnique({
      where: { id },
    });

    console.log('Found phone model:', phoneModel);

    if (!phoneModel) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 404 }
      );
    }

    // Check if the model is already active
    if (phoneModel.status === 'active') {
      return NextResponse.json(
        { error: 'El modelo ya está activo' },
        { status: 400 }
      );
    }

    console.log('Updating phone model status to active');

    // Restore the phone model by setting status to 'active'
    const updated = await prisma.phoneModel.update({
      where: { id },
      data: { status: 'active' },
    });

    console.log('Phone model restored successfully:', updated);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error restoring phone model:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json(
      { error: 'Error al restaurar el modelo', details: error.message },
      { status: 500 }
    );
  }
}
