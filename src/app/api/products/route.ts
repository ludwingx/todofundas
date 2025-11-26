import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// GET /api/products - lista productos activos
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      include: {
        phoneModel: true,
        type: true,
        supplier: true,
        color: { select: { id: true, name: true, hexCode: true } },
        material: { select: { id: true, name: true } },
        compatibility: { select: { id: true, name: true, deviceType: true } },
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error listando productos:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    // Procesar imagen si viene
    let imageUrl: string | null = null;
    const imageFile = formData.get("image");
    if (
      imageFile &&
      typeof imageFile === "object" &&
      "arrayBuffer" in imageFile
    ) {
      const file = imageFile as File;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `product_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.jpg`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    }
    // Validación básica (permitir 0 como valor válido)
    console.log("BODY RECIBIDO", data);
    if (
      !data.phoneModelId ||
      !data.typeId ||
      !data.colorId ||
      data.stock === undefined ||
      data.stock === null ||
      data.priceRetail === undefined ||
      data.priceRetail === null
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios", body: data },
        { status: 400 }
      );
    }
    const product = await prisma.product.create({
      data: {
        phoneModelId: String(data.phoneModelId),
        typeId: String(data.typeId),
        supplierId: data.supplierId ? String(data.supplierId) : null,
        colorId: String(data.colorId),
        materialId: data.materialId ? String(data.materialId) : null,
        compatibilityId: data.compatibilityId
          ? String(data.compatibilityId)
          : null,
        stock: Number(data.stock),
        minStock:
          data.minStock !== undefined && data.minStock !== null
            ? Number(data.minStock)
            : 5,
        priceRetail: Number(data.priceRetail),
        priceWholesale: Number(data.priceWholesale),
        costPrice: Number(data.costPrice),
        hasDiscount: data.hasDiscount === "true" || data.hasDiscount === true,
        discountPercentage: data.discountPercentage
          ? Number(data.discountPercentage)
          : null,
        discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
        imageUrl: imageUrl,
      },
    });
    return NextResponse.json({ success: true, productId: product.id });
  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
