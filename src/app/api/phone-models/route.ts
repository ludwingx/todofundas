import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/phone-models?id=...
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  }
  try {
    await prisma.phoneModel.update({ where: { id }, data: { status: 'deleted' } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar modelo' }, { status: 500 });
  }
}

// PATCH /api/phone-models { id, name }
export async function PATCH(req: NextRequest) {
  try {
    const { id, name } = await req.json();
    if (!id || !name || typeof name !== 'string' || name.length < 2) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const updated = await prisma.phoneModel.update({ where: { id }, data: { name } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al editar modelo' }, { status: 500 });
  }
}

// GET /api/phone-models: lista todos los modelos activos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const models = await prisma.phoneModel.findMany({
      where: status ? { status } : { status: 'active' },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener modelos' }, { status: 500 });
  }
}

// POST /api/phone-models: crea un modelo nuevo
export async function POST(req: NextRequest) {
  console.log('Solicitud POST recibida en /api/phone-models');
  try {
    const body = await req.json();
    console.log('Cuerpo de la solicitud:', body);
    
    const { name } = body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      console.error('Nombre inválido:', name);
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' }, 
        { status: 400 }
      );
    }
    
    // Evitar duplicados (case-insensitive)
    console.log('Buscando modelo existente con nombre:', name);
    const existing = await prisma.phoneModel.findFirst({
      where: { 
        name: { 
          equals: name.trim(), 
          mode: 'insensitive' 
        } 
      },
    });
    
    if (existing) {
      console.log('Modelo ya existe:', existing);
      return NextResponse.json(
        { 
          error: 'Ya existe un modelo con ese nombre',
          existing
        }, 
        { status: 409 }
      );
    }
    
    console.log('Creando nuevo modelo con nombre:', name);
    const created = await prisma.phoneModel.create({ 
      data: { 
        name: name.trim() 
      } 
    });
    
    console.log('Modelo creado exitosamente:', created);
    return NextResponse.json(created, { status: 201 });
    
  } catch (error) {
    console.error('Error en POST /api/phone-models:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear modelo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}
