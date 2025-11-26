import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Actualizar una compatibilidad
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, deviceType } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si existe otra con el mismo nombre
    const existing = await prisma.compatibility.findFirst({
      where: {
        name: name.trim(),
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una compatibilidad con ese nombre" },
        { status: 400 }
      );
    }

    const updated = await prisma.compatibility.update({
      where: { id },
      data: {
        name: name.trim(),
        deviceType: deviceType,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating compatibility:", error);
    return NextResponse.json(
      { error: "Error al actualizar la compatibilidad" },
      { status: 500 }
    );
  }
}

// PATCH: Cambiar estado (activar/desactivar)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await req.json();

    const updated = await prisma.compatibility.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating compatibility status:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado" },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete (cambiar status a 'deleted')
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.compatibility.update({
      where: { id },
      data: { status: "deleted" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting compatibility:", error);
    return NextResponse.json(
      { error: "Error al eliminar la compatibilidad" },
      { status: 500 }
    );
  }
}
