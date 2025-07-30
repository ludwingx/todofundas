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
export async function GET() {
  try {
    const models = await prisma.phoneModel.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener modelos' }, { status: 500 });
  }
}

// POST /api/phone-models: crea un modelo nuevo
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string' || name.length < 2) {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
    }
    // Evitar duplicados (case-insensitive)
    const existing = await prisma.phoneModel.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }
    const created = await prisma.phoneModel.create({ data: { name } });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear modelo' }, { status: 500 });
  }
}
