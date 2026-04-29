'use server'

import { prisma as db } from '@/lib/prisma'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'
import { notifyAdminsAction } from './notifications'
import { randomUUID } from 'crypto'

export type SaleInput = {
  productId: string
  quantity: number
  unitPrice: number
  originalPrice: number
  discountApplied: number
  type: string
  isDamagedStock: boolean
}

export type CreateSaleDTO = {
  customerName?: string
  customerPhone?: string
  clientId?: string
  paymentMethod: string
  notes?: string
  globalDiscountAmount?: number
  globalDiscountPercentage?: number
  items: SaleInput[]
}

export async function createSaleAction(data: CreateSaleDTO) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    const result = await db.$transaction(async (tx) => {
      let totalAmount = 0
      // Genera un ID único para agrupar todos los items de este carrito
      const transactionId = randomUUID()
      
      // 1. Process items
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })
        
        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productId}`)
        }

        if (item.isDamagedStock) {
          if (product.stockDamaged < item.quantity) {
            throw new Error(`Stock dañado insuficiente para ${product.id}`)
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stockDamaged: product.stockDamaged - item.quantity }
          })
        } else {
          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${product.id}`)
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: product.stock - item.quantity }
          })
        }

        const lineSubtotal = item.quantity * item.unitPrice
        
        // Distribuir el descuento global proporcionalmente
        let lineDiscount = 0
        if (data.globalDiscountAmount && data.globalDiscountAmount > 0) {
          const proportion = lineSubtotal / (data.items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0))
          lineDiscount = data.globalDiscountAmount * proportion
        }
        
        // Calcular descuento directo en el producto (por si bajó el unitPrice manualmente)
        const unitDiscount = (item.originalPrice || item.unitPrice) - item.unitPrice
        const lineItemDiscount = unitDiscount * item.quantity
        
        // Sumar descuento propio del item + descuento global proporcional
        const totalLineDiscount = lineItemDiscount + lineDiscount
        const totalPrice = lineSubtotal - lineDiscount

        totalAmount += totalPrice

        // Formatear nota para no perder el tracking de stock dañado
        const finalNotes = item.isDamagedStock 
          ? `[Dañado] ${data.notes || ''}`.trim()
          : data.notes || null

        // Register sale with shared transactionId
        const sale = await tx.sale.create({
          data: {
            transactionId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            originalPrice: item.originalPrice,
            discountApplied: totalLineDiscount,
            discountPercentage: data.globalDiscountPercentage || null,
            totalPrice: totalPrice,
            customerName: data.customerName || null,
            customerPhone: data.customerPhone || null,
            paymentMethod: data.paymentMethod,
            type: item.type,
            clientId: data.clientId || null,
            notes: finalNotes
          }
        })

        const movementNotes = [
          item.isDamagedStock ? '[Stock Dañado]' : '',
          `Cliente: ${data.customerName || 'N/A'}`,
          totalLineDiscount > 0 ? `Descuento: Bs. ${totalLineDiscount.toFixed(2)}` : '',
          data.notes ? `Nota: ${data.notes}` : ''
        ].filter(Boolean).join(' | ')

        // REGISTRAR MOVIMIENTO DE INVENTARIO AUTOMÁTICO
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'salida',
            quantity: item.quantity,
            reason: 'Venta',
            notes: movementNotes,
            reference: `Sale:${sale.id}`,
            userId: session.userId as string
          }
        })

        // REGISTRAR INGRESO EN WALLET (FINANZAS)
        await tx.walletTransaction.create({
          data: {
            type: 'ingreso',
            amount: totalPrice,
            reason: 'Venta de Producto',
            notes: `Venta #${sale.id.slice(0,8)} - Cliente: ${data.customerName || 'N/A'}`,
            referenceId: sale.id,
            referenceType: 'Sale',
            userId: session.userId as string
          }
        })
      }

      return totalAmount
    })

    revalidatePath('/ventas')
    revalidatePath('/ventas/nueva')
    revalidatePath('/dashboard')
    revalidatePath('/inventario/productos')

    // Notificar a admins sobre la venta
    await notifyAdminsAction(
      'Nueva venta registrada',
      `Venta por Bs. ${result.toFixed(2)} (${data.items.length} producto${data.items.length > 1 ? 's' : ''}) - ${data.paymentMethod}`,
      'success'
    )

    // Verificar stock bajo y notificar
    for (const item of data.items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        include: { type: true, phoneModel: true }
      })
      if (product && product.stock <= product.minStock) {
        await notifyAdminsAction(
          'Stock bajo detectado',
          `${product.type.name} ${product.phoneModel.name} tiene solo ${product.stock} unidades (mín: ${product.minStock})`,
          'warning'
        )
      }
    }
    
    return { success: true, totalAmount: result }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al procesar la venta'
    return { success: false, error: msg }
  }
}
