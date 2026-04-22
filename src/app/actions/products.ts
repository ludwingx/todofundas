"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(_prevState: unknown, formData: FormData) {
  try {
    const phoneModelId = String(formData.get("phoneModelId") || "");
    const colorName = String(formData.get("color") || "");
    const colorHex = String(formData.get("colorHex") || "#000000"); // Asumimos que viene un hex o usamos negro por defecto
    const stock = Number(formData.get("stock"));
    const minStock =
      formData.get("minStock") !== null ? Number(formData.get("minStock")) : 5;
    const priceRetail = Number(formData.get("priceRetail"));
    const priceWholesale = Number(formData.get("priceWholesale"));
    const costPrice = Number(formData.get("costPrice"));
    const typeId = String(formData.get("typeId") || "");
    const supplierIdRaw = formData.get("supplierId");
    const supplierId = supplierIdRaw ? String(supplierIdRaw) : null;
    const imageEntry = formData.get("image");
    const imageFile =
      imageEntry && typeof imageEntry === "object" && "size" in imageEntry
        ? (imageEntry as File)
        : null;

    // LOG: mostrar todos los datos que llegan
    console.log("DEBUG createProduct", {
      phoneModelId,
      colorName,
      colorHex,
      stock,
      minStock,
      priceRetail,
      priceWholesale,
      costPrice,
      typeId,
      supplierId,
    });

    // Validaciones básicas
    if (
      !phoneModelId ||
      !colorName ||
      isNaN(stock) ||
      isNaN(priceRetail) ||
      isNaN(priceWholesale) ||
      isNaN(costPrice)
    ) {
      return {
        error:
          "Todos los campos obligatorios deben ser completados correctamente",
      };
    }

    if (
      stock < 0 ||
      priceRetail <= 0 ||
      priceWholesale <= 0 ||
      costPrice <= 0
    ) {
      return { error: "Los valores numéricos deben ser positivos" };
    }

    let imageUrl: string | null = null;
    
    // Supabase has been removed. If image uploads are needed later, 
    // a different storage provider should be implemented here.

    let productType = await prisma.productType.findFirst({
      where: { id: typeId },
    });

    if (!productType) {
      productType = await prisma.productType.create({
        data: {
          id: typeId,
          name: "Funda", // Tipo por defecto
        },
      });
    }

    // Buscar o crear el color
    let color = await prisma.color.findFirst({
      where: { name: colorName },
    });

    if (!color) {
      color = await prisma.color.create({
        data: {
          name: colorName,
          hexCode: colorHex,
          status: "active",
        },
      });
    }

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        phoneModelId,
        colorId: color.id,
        stock,
        minStock,
        priceRetail,
        priceWholesale,
        costPrice,
        typeId: productType.id,
        supplierId: supplierId || undefined,
        imageUrl,
      },
    });

    // Crear movimiento de inventario inicial
    // Por ahora omitimos el movimiento inicial hasta tener un sistema de usuarios completo
    // await prisma.inventoryMovement.create({
    //   data: {
    //     productId: product.id,
    //     type: 'entrada',
    //     quantity: stock,
    //     reason: 'stock_inicial',
    //     notes: 'Stock inicial del producto',
    //     userId: session.userId // Necesitamos el ID del usuario de la sesión
    //   }
    // })

    revalidatePath("/inventory");
    revalidatePath("/inventory/products");
    revalidatePath("/dashboard");

    return { success: true, productId: product.id };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Error al crear el producto. Intenta nuevamente." };
  }
}

export async function getProductTypes() {
  try {
    const types = await prisma.productType.findMany({
      orderBy: { name: "asc" },
    });
    return types;
  } catch (error) {
    console.error("Error fetching product types:", error);
    return [];
  }
}

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
    return suppliers;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        type: {
          select: {
            name: true,
          },
        },
        supplier: {
          select: {
            name: true,
          },
        },
        phoneModel: {
          select: {
            name: true,
          },
        },
        color: {
          select: {
            name: true,
            hexCode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function deleteProduct(productId: string) {
  try {
    // Verificar si el producto tiene ventas
    const salesCount = await prisma.sale.count({
      where: { productId },
    });

    if (salesCount > 0) {
      return {
        error: "No se puede eliminar un producto que tiene ventas registradas",
      };
    }

    // Eliminar movimientos de inventario relacionados
    await prisma.inventoryMovement.deleteMany({
      where: { productId },
    });

    // Eliminar el producto
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/inventory");
    revalidatePath("/inventory/products");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Error al eliminar el producto" };
  }
}

export async function reportDamagedProductAction(
  productId: string,
  quantity: number,
  type: "absolute_loss" | "damaged_stock",
  notes: string
) {
  try {
    const { getSession } = await import("./auth")
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: "No autorizado" };
    }

    if (quantity <= 0) {
      return { error: "La cantidad debe ser mayor a cero" };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { error: "Producto no encontrado" };
    }

    if (product.stock < quantity) {
      return { error: "No hay suficiente stock sano para descontar esta cantidad" };
    }

    // Calcular nuevos stocks
    const newStock = product.stock - quantity;
    const newStockDamaged =
      type === "damaged_stock" ? (product.stockDamaged || 0) + quantity : product.stockDamaged;

    // Transacción para asegurar la integridad
    await prisma.$transaction(async (tx) => {
      // 1. Actualizar stock del producto
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
          stockDamaged: newStockDamaged,
        },
      });

      // 2. Registrar movimiento de inventario (Salida del stock sano)
      await tx.inventoryMovement.create({
        data: {
          productId,
          type: "salida",
          quantity: quantity,
          reason: type === "absolute_loss" ? "perdida" : "dano",
          notes: notes || (type === "absolute_loss" ? "Pérdida absoluta registrada" : "Movido a stock dañado"),
          userId: session.userId as string,
        },
      });
    });

    revalidatePath("/(dashboard)/inventario");
    revalidatePath("/(dashboard)/inventario/productos");

    return { success: true };
  } catch (error) {
    console.error("Error reporting damaged product:", error);
    return { error: "Error al registrar la pérdida/daño" };
  }
}
