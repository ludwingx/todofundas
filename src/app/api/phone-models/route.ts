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
      include: {
        brand: {
          select: {
            name: true
          }
        }
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener modelos' }, { status: 500 });
  }
}

// POST /api/phone-models: crea uno o varios modelos nuevos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, names, brandId } = body as { name?: string; names?: string[]; brandId?: string };

    if (!brandId || typeof brandId !== 'string') {
      return NextResponse.json({ error: 'Debes seleccionar una marca válida' }, { status: 400 });
    }

    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand || brand.status !== 'active') {
      return NextResponse.json({ error: 'La marca seleccionada no es válida o está inactiva' }, { status: 400 });
    }

    const namesToProcess = names || (name ? [name] : []);
    
    if (namesToProcess.length === 0) {
      return NextResponse.json({ error: 'Debes proporcionar al menos un nombre de modelo' }, { status: 400 });
    }

    const results = {
      created: [] as any[],
      skipped: [] as string[],
      errors: [] as string[]
    };

    for (const modelName of namesToProcess) {
      const trimmedName = modelName.trim();
      if (trimmedName.length < 2) {
        results.errors.push(`${modelName}: Nombre demasiado corto`);
        continue;
      }

      const existing = await prisma.phoneModel.findFirst({
        where: {
          brandId,
          name: { equals: trimmedName, mode: 'insensitive' },
          status: 'active'
        },
      });

      if (existing) {
        results.skipped.push(trimmedName);
        continue;
      }

      const created = await prisma.phoneModel.create({
        data: { name: trimmedName, brandId },
      });
      results.created.push(created);
    }

    return NextResponse.json({
      message: `${results.created.length} modelos creados${results.skipped.length > 0 ? `, ${results.skipped.length} omitidos por ya existir` : ''}`,
      results
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error en POST /api/phone-models:', error);
    return NextResponse.json({ error: 'Error al crear modelos' }, { status: 500 });
  }
}
