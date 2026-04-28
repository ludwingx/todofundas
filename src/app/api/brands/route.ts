import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Listar marcas (activas o todas según parámetro all)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  const brands = await prisma.brand.findMany({
    where: all ? undefined : { status: "active" },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(brands);
}

// POST: Crear una nueva marca
export async function POST(req: Request) {
  try {
    const { name, logoUrl } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existing = await prisma.brand.findFirst({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una marca con ese nombre" },
        { status: 400 }
      );
    }

    const created = await prisma.brand.create({
      data: {
        name: name.trim(),
        status: "active",
        logoUrl: logoUrl && typeof logoUrl === "string" && logoUrl.trim() !== "" ? logoUrl.trim() : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Error al crear la marca" },
      { status: 500 }
    );
  }
}
