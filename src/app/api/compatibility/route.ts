import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Listar todas las compatibilidades activas
export async function GET() {
  const compatibilities = await prisma.compatibility.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(compatibilities);
}

// POST: Crear una nueva compatibilidad
export async function POST(req: Request) {
  try {
    const { name, deviceType } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existing = await prisma.compatibility.findFirst({
      where: {
        OR: [{ name: name.trim() }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una compatibilidad con ese nombre" },
        { status: 400 }
      );
    }

    const created = await prisma.compatibility.create({
      data: {
        name: name.trim(),
        deviceType: deviceType || "Smartphone", // Valor por defecto
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating compatibility:", error);
    return NextResponse.json(
      { error: "Error al crear la compatibilidad" },
      { status: 500 }
    );
  }
}
