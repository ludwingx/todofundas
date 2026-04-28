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
        color: { select: { id: true, name: true, hexCode: true } },
        material: { select: { id: true, name: true } },
        images: true,
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
      if (key !== 'images') {
        data[key] = value;
      }
    }

    // Procesar múltiples imágenes subiendo a la nube (OB_FILES)
    const imagesFiles = formData.getAll("images");
    const coverIndex = Number(formData.get("coverIndex") || 0);
    const productImagesData = [];
    let primaryImageUrl: string | null = null;

    const { uploadToOBFiles } = await import("@/lib/ob-files");

    for (let i = 0; i < imagesFiles.length; i++) {
      const imageFile = imagesFiles[i];
      if (
        imageFile &&
        typeof imageFile === "object" &&
        "arrayBuffer" in imageFile
      ) {
        const file = imageFile as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `product_${Date.now()}_${i}.jpg`;
        
        // Subir a la nube
        const uploadRes = await uploadToOBFiles(buffer, filename, file.type || "image/jpeg");
        
        if (uploadRes.success && uploadRes.url) {
          const url = uploadRes.url;
          const isCover = i === coverIndex;
          if (isCover) primaryImageUrl = url;
          
          productImagesData.push({
            url,
            isCover
          });
        }
      }
    }

    // Si no hay cover explícito pero hay imágenes, la primera es el cover
    if (!primaryImageUrl && productImagesData.length > 0) {
      primaryImageUrl = productImagesData[0].url;
      productImagesData[0].isCover = true;
    }

    // Validación básica
    if (
      !data.phoneModelId ||
      !data.typeId ||
      !data.colorId
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
        colorId: String(data.colorId),
        materialId: data.materialId ? String(data.materialId) : null,
        minStock:
          data.minStock !== undefined && data.minStock !== null
            ? Number(data.minStock)
            : 5,
        priceRetail: data.priceRetail ? Number(data.priceRetail) : null,
        priceWholesale: data.priceWholesale ? Number(data.priceWholesale) : null,
        isPublic: data.isPublic === "true" || data.isPublic === true,
        publicPrice: data.publicPrice ? Number(data.publicPrice) : null,
        hasDiscount: data.hasDiscount === "true" || data.hasDiscount === true,
        discountPercentage: data.discountPercentage
          ? Number(data.discountPercentage)
          : null,
        discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
        imageUrl: primaryImageUrl,
        images: {
          create: productImagesData
        }
      },
      include: {
        images: true
      }
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
