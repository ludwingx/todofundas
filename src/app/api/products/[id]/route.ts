import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Iniciando actualización del producto ${id}`);

    const formData = await req.formData();
    const data: Record<string, unknown> = {};

    // Convertir FormData a objeto para facilitar el manejo
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    console.log(
      "Datos recibidos en el servidor:",
      JSON.stringify(data, null, 2)
    );

    // Validación de campos requeridos
    const requiredFields = ["phoneModelId", "typeId", "priceRetail"];
    const missingFields = requiredFields.filter(
      (field) => !data[field] && data[field] !== 0
    );

    if (missingFields.length > 0) {
      console.error("Faltan campos obligatorios:", missingFields);
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios",
          missingFields,
          receivedData: data,
        },
        { status: 400 }
      );
    }

    // PROCESAR IMÁGENES
    const existingImagesData = formData.get("existingImages");
    const existingImages = existingImagesData ? JSON.parse(String(existingImagesData)) : [];
    const newImagesFiles = formData.getAll("images");
    const coverIndex = Number(formData.get("coverIndex") || 0);

    const { uploadToOBFiles } = await import("@/lib/ob-files");
    const productImagesData = [];
    let primaryImageUrl: string | null = null;

    // 1. Identificar imágenes existentes a mantener
    const currentImages = await prisma.productImage.findMany({
      where: { productId: id }
    });

    // Eliminar las que ya no están en la lista
    const keepUrls = existingImages.map((img: any) => img.url);
    const toDelete = currentImages.filter(img => !keepUrls.includes(img.url));
    
    if (toDelete.length > 0) {
      await prisma.productImage.deleteMany({
        where: { id: { in: toDelete.map(img => img.id) } }
      });
    }

    // Preparar datos de las que se quedan
    for (const img of existingImages) {
      const isCover = existingImages.indexOf(img) === coverIndex;
      if (isCover) primaryImageUrl = img.url;
      productImagesData.push({
        url: img.url,
        isCover
      });
    }

    // 2. Procesar nuevas imágenes
    for (let i = 0; i < newImagesFiles.length; i++) {
      const imageFile = newImagesFiles[i];
      if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile) {
        const file = imageFile as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `product_${id}_${Date.now()}_${i}.jpg`;
        
        const uploadRes = await uploadToOBFiles(buffer, filename, file.type || "image/jpeg");
        
        if (uploadRes.success && uploadRes.url) {
          const url = uploadRes.url;
          // El coverIndex se refiere a la posición global o solo de las nuevas?
          // En ProductForm lo calculamos globalmente. 
          // Ajustemos: si el coverIndex es >= existingImages.length, es una de las nuevas.
          const isCover = (existingImages.length + i) === coverIndex;
          if (isCover) primaryImageUrl = url;
          
          productImagesData.push({
            url,
            isCover
          });
        }
      }
    }

    // Si no hay cover después de procesar todo, el primero es el cover
    if (!primaryImageUrl && productImagesData.length > 0) {
      primaryImageUrl = productImagesData[0].url;
      productImagesData[0].isCover = true;
    }

    const updateData: any = {
      phoneModelId: String(data.phoneModelId),
      typeId: String(data.typeId),
      supplierId: data.supplierId ? String(data.supplierId) : null,
      colorId: data.colorId ? String(data.colorId) : undefined,
      materialId: data.materialId && data.materialId !== "" ? String(data.materialId) : null,
      stock: Number(data.stock) || 0,
      minStock: data.minStock !== undefined ? Number(data.minStock) : 0,
      priceRetail: Number(data.priceRetail) || 0,
      priceWholesale: data.priceWholesale ? Number(data.priceWholesale) : 0,
      costPrice: data.costPrice ? Number(data.costPrice) : 0,
      isPublic: data.isPublic === "true" || data.isPublic === true,
      publicPrice: data.publicPrice && data.publicPrice !== "null" ? Number(data.publicPrice) : null,
      hasDiscount: data.hasDiscount === "true" || data.hasDiscount === true,
      discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : null,
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      imageUrl: primaryImageUrl,
    };

    console.log("Datos para actualizar:", JSON.stringify(updateData, null, 2));

    // Actualizar el producto y sus imágenes
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Limpiar imágenes actuales (ya borramos las que no queríamos arriba, pero por seguridad y orden lo manejamos aquí)
      await tx.productImage.deleteMany({ where: { productId: id } });
      
      // 2. Crear las nuevas (o recrear las que mantenemos)
      await tx.productImage.createMany({
        data: productImagesData.map(img => ({
          ...img,
          productId: id
        }))
      });

      // 3. Actualizar producto
      return await tx.product.update({
        where: { id },
        data: updateData,
      });
    });

    console.log("Producto actualizado correctamente:", updated.id);
    return NextResponse.json({ success: true, productId: updated.id });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - actualizar solo estado u otros campos simples via JSON
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.status) {
      data.status = String(body.status);
    }
    if (body.minStock !== undefined) data.minStock = Number(body.minStock);
    if (body.isPublic !== undefined) data.isPublic = Boolean(body.isPublic);
    if (body.publicPrice !== undefined) {
      data.publicPrice = body.publicPrice === null ? null : Number(body.publicPrice);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nada para actualizar" },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error en PATCH product:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - soft delete (status = 'deleted')
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.update({ where: { id }, data: { status: "deleted" } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
