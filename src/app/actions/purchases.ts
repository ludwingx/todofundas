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
      const itemObj: any = {
        quantityOrdered: item.quantityOrdered,
        unitCost: item.unitCost,
        totalCost: lineTotal,
      };

      if (item.productId) itemObj.productId = item.productId;
      if (item.productTypeId) itemObj.productTypeId = item.productTypeId;

      return itemObj;
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

        // 2. Actualizar el stock del producto principal (solo si tiene un ID de producto asignado)
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantityGood },
              stockDamaged: { increment: item.quantityDamaged }
              // quantityLost no incrementa ningún stock porque es pérdida total
            }
          });
        }

        // 3. Registrar movimientos de inventario (solo si tiene un ID de producto asignado)
        if (item.productId && item.quantityGood > 0) {
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

        if (item.productId && item.quantityDamaged > 0) {
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

        if (item.productId && item.quantityLost > 0) {
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

      // REGISTRAR EGRESO EN WALLET (INVERSIÓN EN INVENTARIO)
      // Buscamos la compra de nuevo para tener los datos de los items y proveedor
      const purchase = await tx.purchase.findUnique({
        where: { id: purchaseId },
        include: { supplier: true, items: true }
      });

      if (purchase) {
        let totalInvestment = 0;
        for (const item of itemsData) {
          const originalItem = purchase.items.find(i => i.id === item.id);
          if (originalItem) {
            totalInvestment += (item.quantityGood + item.quantityDamaged) * originalItem.unitCost;
          }
        }

        if (totalInvestment > 0) {
          await tx.walletTransaction.create({
            data: {
              type: 'egreso',
              amount: totalInvestment,
              reason: 'Compra de Mercadería',
              notes: `Recepción de pedido #${purchase.id.slice(0,8)} - Proveedor: ${purchase.supplier.name}`,
              referenceId: purchase.id,
              referenceType: 'Purchase',
              userId: session.userId as string
            }
          });
        }
      }
    });

    revalidatePath("/compras");
    revalidatePath("/inventario/productos");
    return { success: true };
  } catch (error) {
    console.error("Error recibiendo compra:", error);
    return { error: "Error procesando la recepción del inventario" };
  }
}

export async function assignStockAction(purchaseId: string, assignments: { purchaseItemId: string; productId: string; quantityGood: number; quantityDamaged: number }[]) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      for (const assig of assignments) {
        const { purchaseItemId, productId, quantityGood, quantityDamaged } = assig;

        // 1. Obtener el item original
        const originalItem = await tx.purchaseItem.findUnique({
          where: { id: purchaseItemId }
        });

        if (!originalItem) continue;

        // Si es una asignación total (o la primera parte de una división)
        // Actualizamos el item original si aún no tiene productId
        if (!originalItem.productId) {
          // Si la cantidad asignada es EXACTAMENTE la cantidad del item, simplemente actualizamos el productId
          if (quantityGood === originalItem.quantityGood && quantityDamaged === originalItem.quantityDamaged) {
            await tx.purchaseItem.update({
              where: { id: purchaseItemId },
              data: { productId }
            });
          } else {
            // Si es una división, creamos un NUEVO item para esta parte y restamos del original
            await tx.purchaseItem.create({
              data: {
                purchaseId,
                productId,
                productTypeId: originalItem.productTypeId,
                quantityOrdered: 0, // Ya fue pedida en el original
                quantityGood: quantityGood,
                quantityDamaged: quantityDamaged,
                unitCost: originalItem.unitCost,
                totalCost: (quantityGood + quantityDamaged) * originalItem.unitCost
              }
            });

            await tx.purchaseItem.update({
              where: { id: purchaseItemId },
              data: {
                quantityGood: { decrement: quantityGood },
                quantityDamaged: { decrement: quantityDamaged },
                totalCost: { decrement: (quantityGood + quantityDamaged) * originalItem.unitCost }
              }
            });
          }
        } else {
          // Si por alguna razón ya tenía productId (no debería pasar por el filtro del UI), 
          // creamos uno nuevo o ignoramos. Aquí optamos por crear uno nuevo vinculado a la compra.
           await tx.purchaseItem.create({
              data: {
                purchaseId,
                productId,
                productTypeId: originalItem.productTypeId,
                quantityOrdered: 0,
                quantityGood,
                quantityDamaged,
                unitCost: originalItem.unitCost,
                totalCost: (quantityGood + quantityDamaged) * originalItem.unitCost
              }
            });
        }

        // 2. Incrementar Stock del producto destino
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: { increment: quantityGood },
            stockDamaged: { increment: quantityDamaged }
          }
        });

        // 3. Registrar Movimientos
        if (quantityGood > 0) {
          await tx.inventoryMovement.create({
            data: {
              productId,
              type: "entrada",
              quantity: quantityGood,
              reason: "Asignación de variante (Stock Bueno)",
              reference: `Purchase:${purchaseId}`,
              userId: session.userId as string
            }
          });
        }

        if (quantityDamaged > 0) {
          await tx.inventoryMovement.create({
            data: {
              productId,
              type: "entrada",
              quantity: quantityDamaged,
              reason: "Asignación de variante (Dañado Vendible)",
              reference: `Purchase:${purchaseId}`,
              userId: session.userId as string
            }
          });
        }
      }
    });

    revalidatePath("/compras");
    revalidatePath("/inventario/productos");
    return { success: true };
  } catch (error: any) {
    console.error("Error asignando stock:", error);
    return { error: error.message || "Error al procesar la asignación" };
  }
}

export async function editReceivePurchaseAction(purchaseId: string, itemsData: { id: string; quantityGood: number; quantityDamaged: number; quantityLost: number; productId: string | null }[]) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of itemsData) {
        // 1. Obtener datos actuales
        const currentItem = await tx.purchaseItem.findUnique({
          where: { id: item.id }
        });

        if (!currentItem) continue;

        // 2. REVERTIR impacto previo en stock (si tenía producto asignado)
        if (currentItem.productId) {
          await tx.product.update({
            where: { id: currentItem.productId },
            data: {
              stock: { decrement: currentItem.quantityGood },
              stockDamaged: { decrement: currentItem.quantityDamaged }
            }
          });
          
          // Registrar movimiento de corrección (reverso)
          await tx.inventoryMovement.create({
            data: {
              productId: currentItem.productId,
              type: "ajuste",
              quantity: currentItem.quantityGood + currentItem.quantityDamaged,
              reason: "Corrección de recepción (Reverso)",
              reference: `Purchase:${purchaseId}:Correction`,
              userId: session.userId as string
            }
          });
        }

        // 3. ACTUALIZAR Item de compra
        await tx.purchaseItem.update({
          where: { id: item.id },
          data: {
            quantityGood: item.quantityGood,
            quantityDamaged: item.quantityDamaged + item.quantityLost
          }
        });

        // 4. APLICAR nuevo impacto en stock (si tiene producto asignado)
        const productId = item.productId || currentItem.productId;
        if (productId) {
          await tx.product.update({
            where: { id: productId },
            data: {
              stock: { increment: item.quantityGood },
              stockDamaged: { increment: item.quantityDamaged }
            }
          });

          // Registrar movimientos nuevos
          if (item.quantityGood > 0) {
            await tx.inventoryMovement.create({
              data: {
                productId: productId,
                type: "entrada",
                quantity: item.quantityGood,
                reason: "Corrección de recepción (Nuevo Stock)",
                reference: `Purchase:${purchaseId}:Correction`,
                userId: session.userId as string
              }
            });
          }
          if (item.quantityDamaged > 0) {
             await tx.inventoryMovement.create({
              data: {
                productId: productId,
                type: "entrada",
                quantity: item.quantityDamaged,
                reason: "Corrección de recepción (Nuevo Dañado)",
                reference: `Purchase:${purchaseId}:Correction`,
                userId: session.userId as string
              }
            });
          }
        }
      }
    });

    revalidatePath("/compras");
    revalidatePath(`/compras/${purchaseId}`);
    revalidatePath("/inventario/productos");
    return { success: true };
  } catch (error: any) {
    console.error("Error editando recepción:", error);
    return { error: error.message || "Error al corregir la recepción" };
  }
}

