'use server'

import { prisma as db } from '@/lib/prisma'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'
import { notifyAdminsAction } from './notifications'

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
  paymentMethod: string
  notes?: string
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
          // Reduce damaged stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stockDamaged: product.stockDamaged - item.quantity }
          })
        } else {
          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${product.id}`)
          }
          // Reduce normal stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: product.stock - item.quantity }
          })
        }

        const totalPrice = item.quantity * item.unitPrice
        totalAmount += totalPrice

        // Register sale
        await tx.sale.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            originalPrice: item.originalPrice,
            discountApplied: item.discountApplied,
            totalPrice: totalPrice,
            customerName: data.customerName || null,
            customerPhone: data.customerPhone || null,
            paymentMethod: data.paymentMethod,
            type: item.type,
            notes: data.notes || (item.isDamagedStock ? 'Venta de stock dañado' : null)
          }
        })
      }

      return totalAmount
    })

    revalidatePath('/(dashboard)/ventas')
    revalidatePath('/(dashboard)/dashboard')
    revalidatePath('/(dashboard)/inventario')

    // Notificar a admins sobre la venta
    await notifyAdminsAction(
      'Nueva venta registrada',
      `Venta por $${result.toFixed(2)} (${data.items.length} producto${data.items.length > 1 ? 's' : ''}) - ${data.paymentMethod}`,
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
