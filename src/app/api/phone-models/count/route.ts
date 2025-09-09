import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const count = await prisma.phoneModel.count({
      where: status ? { status } : {}
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting phone models:', error);
    return NextResponse.json(
      { error: 'Error al contar los modelos' },
      { status: 500 }
    );
  }
}
