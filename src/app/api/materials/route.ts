import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Listar todos los materiales activos
export async function GET() {
  const materials = await prisma.material.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(materials);
}

// POST: Crear un nuevo material
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existing = await prisma.material.findFirst({
      where: {
        OR: [{ name: name.trim() }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un material con ese nombre" },
        { status: 400 }
      );
    }

    const created = await prisma.material.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Error al crear el material" },
      { status: 500 }
    );
  }
}
