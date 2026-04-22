"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

export async function createPurchaseAction(data: any) {
  const session = await getSession();
  if (!session) {
    return { error: "No autorizado" };
  }

  try {
    const { supplierId, invoiceNumber, notes, items, totalAmount } = data;

    if (!supplierId || !items || items.length === 0) {
      return { error: "Faltan datos requeridos (proveedor y productos)" };
    }

    // Calculamos el total de nuevo en el backend por seguridad
    let calculatedTotal = 0;
    const itemsData = items.map((item: any) => {
      const lineTotal = item.quantityOrdered * item.unitCost;
      calculatedTotal += lineTotal;
      return {
        productId: item.productId,
        quantityOrdered: item.quantityOrdered,
        unitCost: item.unitCost,
        totalCost: lineTotal,
      };
    });

    const purchase = await prisma.purchase.create({
      data: {
        supplierId,
        invoiceNumber: invoiceNumber || null,
        notes: notes || null,
        totalAmount: calculatedTotal,
        status: "pendiente", // El filtro de realidad (recibir) se hace después
        items: {
          create: itemsData
        }
      }
    });

    revalidatePath("/compras");
    return { success: true, purchaseId: purchase.id };
  } catch (error) {
    console.error("Error creando compra:", error);
    return { error: "Ocurrió un error al registrar el pedido" };
  }
}

export async function receivePurchaseAction(purchaseId: string, itemsData: { id: string; quantityGood: number; quantityDamaged: number; quantityLost: number; productId: string }[]) {
  const session = await getSession();
  if (!session) {
    return { error: "No autorizado" };
  }

  try {
    // Usamos una transacción para asegurar que todo se actualiza correctamente
    await prisma.$transaction(async (tx) => {
      let totalGood = 0;
      let totalDamaged = 0;
      let totalLost = 0;
      let totalOrdered = 0;

      for (const item of itemsData) {
        // 1. Actualizar el item de la compra. Guardamos la suma en quantityDamaged para mantener el esquema, 
        // pero registramos los movimientos exactos abajo.
        const purchaseItem = await tx.purchaseItem.update({
          where: { id: item.id },
          data: {
            quantityGood: item.quantityGood,
            quantityDamaged: item.quantityDamaged + item.quantityLost
          }
        });

        totalGood += item.quantityGood;
        totalDamaged += item.quantityDamaged;
        totalLost += item.quantityLost;
        totalOrdered += purchaseItem.quantityOrdered;

        // 2. Actualizar el stock del producto principal
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantityGood },
            stockDamaged: { increment: item.quantityDamaged }
            // quantityLost no incrementa ningún stock porque es pérdida total
          }
        });

        // 3. Registrar movimientos de inventario
        if (item.quantityGood > 0) {
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: "entrada",
              quantity: item.quantityGood,
              reason: "Recepción de compra (Stock Bueno)",
              reference: `Purchase:${purchaseId}`,
              userId: session.userId as string
            }
          });
        }

        if (item.quantityDamaged > 0) {
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: "entrada",
              quantity: item.quantityDamaged,
              reason: "Recepción de compra (Dañado Vendible)",
              reference: `Purchase:${purchaseId}`,
              userId: session.userId as string
            }
          });
        }

        if (item.quantityLost > 0) {
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: "salida", // Se asume como un ingreso fallido que se da de baja
              quantity: item.quantityLost,
              reason: "perdida",
              notes: "Recepción de compra (Pérdida Absoluta / Inutilizable)",
              reference: `Purchase:${purchaseId}`,
              userId: session.userId as string
            }
          });
        }
      }

      // 4. Actualizar el estado de la compra principal
      // Si recibimos todo (bueno + dañado) = cantidad pedida, entonces está 'recibido'.
      // De lo contrario 'parcial'. (Esto es simplificado, en realidad Market GS asume pérdida si no cuadra).
      const newStatus = (totalGood + totalDamaged) >= totalOrdered ? "recibido" : "parcial";

      await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: newStatus,
          receivedAt: new Date()
        }
      });
    });

    revalidatePath("/compras");
    revalidatePath("/inventario/productos");
    return { success: true };
  } catch (error) {
    console.error("Error recibiendo compra:", error);
    return { error: "Error procesando la recepción del inventario" };
  }
}

