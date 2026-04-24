import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { imageId } = await req.json();

    if (!imageId) {
      return NextResponse.json({ error: "Falta imageId" }, { status: 400 });
    }

    // 1. Obtener la nueva imagen de portada
    const newCover = await prisma.productImage.findUnique({
      where: { id: imageId }
    });

    if (!newCover || newCover.productId !== id) {
      return NextResponse.json({ error: "Imagen no válida para este producto" }, { status: 404 });
    }

    // 2. Realizar la actualización en una transacción
    await prisma.$transaction([
      // Quitar isCover de todas las imágenes del producto
      prisma.productImage.updateMany({
        where: { productId: id },
        data: { isCover: false }
      }),
      // Poner isCover en la seleccionada
      prisma.productImage.update({
        where: { id: imageId },
        data: { isCover: true }
      }),
      // Actualizar el imageUrl principal del producto
      prisma.product.update({
        where: { id },
        data: { imageUrl: newCover.url }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar portada:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
