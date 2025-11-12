import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    console.log('Iniciando conteo de modelos...');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    console.log('Parámetros de búsqueda:', { status });
    
    const count = await prisma.phoneModel.count({
      where: status ? { status } : {}
    });

    console.log('Conteo exitoso:', { count });
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error detallado al contar modelos:', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      errorCode: error.code,
      meta: error.meta
    });
    
    return NextResponse.json(
      { 
        error: 'Error al contar los modelos',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          meta: error.meta
        } : undefined
      },
      { status: 500 }
    );
  }
}
